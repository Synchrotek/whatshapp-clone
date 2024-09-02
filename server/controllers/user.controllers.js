const { TryCatch } = require('../middlewares/error.js');
const { User } = require('../models/user.models.js');
const { Chat } = require('../models/chat.models.js');
const { FRequest } = require('../models/frequest.models.js');
const { sendToken } = require('../utils/sendToken.js');
const { ErrorResponse: ErrResp } = require('../middlewares/error.js');
const { emitEvent } = require('../utils/socketUtils.js');
const socketEvents = require('../constants/socketEvents.js');
const bcrypt = require('bcryptjs');
const { getOtherMember } = require('../lib/helper.js');

exports.register = TryCatch(async (req, res) => {
    const { name, email, password, bio } = req.body;

    const user = await User.create({
        name, bio,
        email, password,
        avatar: {
            public_id: "bochii12",
            url: "https://i.pinimg.com/originals/cc/80/f3/cc80f38579887963c2d71d7060081ea3.jpg"
        }
    });
    sendToken(res, user, 201, "User created");
});

exports.login = TryCatch(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({
        email
    }).select("+password");

    if (!user) {
        return res.status(400).json({
            success: false,
            message: "Email not registerd, Please register with this email before login."
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: "Invalid credentials"
        });
    }
    sendToken(res, user, 200, `Welcome back, ${user.name}`);
});

exports.getMyProfile = TryCatch(async (req, res) => {

    const user = await User.findById(req.userId);

    res.status(200).json({
        success: true,
        data: user
    });
});

exports.logout = TryCatch(async (req, res) => {
    res.cookie("app_token", "", {
        maxAge: 0,
        sameSite: "none",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    });

    res.status(200).json({
        success: true,
        message: "Logout successful."
    });
});

exports.searchUser = TryCatch(async (req, res) => {
    const { name } = req.query;

    console.log("name:", name);

    const mySingleChats = await Chat.find({
        groupChat: false,
        members: req.userId
    });

    const allUsersFromMyChats = mySingleChats.flatMap((chat) => chat.members);

    const allUsersExceptMeAndFriends = await User.find({
        _id: { $nin: allUsersFromMyChats },
        name: { $regex: name, $options: "i" },
    });

    const searchedUsers = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => {
        return { _id, name, avatar: avatar.url }
    });

    res.status(200).json({
        success: true,
        data: searchedUsers
    });
});

exports.sendFriendRequest = TryCatch(async (req, res) => {
    const { userId } = req.body;

    const frequest = await FRequest.findOne({
        $or: [
            { sender: req.userId, receiver: userId },
            { sender: userId, receiver: req.userId },
        ]
    });

    if (frequest) return ErrResp(res, 400, "Friend request already sent.");

    await FRequest.create({
        sender: req.userId,
        receiver: userId
    });

    emitEvent(req, socketEvents.NEW_REQUEST, [userId]);

    res.status(200).json({
        success: true,
        message: "Friend request sent."
    });
});

exports.acceptFriendRequest = TryCatch(async (req, res) => {
    const { f_requestId, accept } = req.body;

    const frequest = await FRequest.findById(f_requestId)
        .populate("sender", "name")
        .populate("receiver", "name");

    if (!frequest) return ErrResp(res, 404, "Friend request not Found.");

    if (frequest.receiver._id.toString() !== req.userId.toString()) {
        return ErrResp(res, 401, "Not authorized to accept this friend request.");
    };
    if (!accept) {
        await frequest.deleteOne();

        return res.status(200).json({
            status: true,
            message: "Friend request rejected"
        });
    }

    const members = [frequest.sender._id, frequest.receiver._id];

    await Promise.all([
        Chat.create({ members, name: `${frequest.sender.name}-${frequest.receiver.name}` }),
        frequest.deleteOne()
    ]);

    emitEvent(req, socketEvents.REFETCH_CHATS, members)

    res.status(200).json({
        success: true,
        message: "Friend request accepted.",
        data: { senderId: frequest.sender._id },
    });
});

exports.getAllNotifications = TryCatch(async (req, res) => {

    const frequest = await FRequest.find({ receiver: req.userId })
        .populate("sender", "name avatar");

    const allRequests = frequest.map(({ _id, sender }) => ({
        _id,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url,
        },
    }));

    res.status(200).json({
        success: true,
        data: { allRequests },
    });
});

exports.getMyFriends = TryCatch(async (req, res) => {

    const { chatId } = req.query;

    const chats = await Chat.find({
        members: req.userId,
        groupChat: false
    }).populate("members", "name avatar");

    const friends = chats.map(async ({ members }) => {
        const otherMember = await getOtherMember(members, req.userId)

        console.log("otherMember:", otherMember);

        return {
            _id: otherMember._id,
            name: otherMember.name,
            avatar: otherMember.avatar.url,
        };
    });

    if (chatId) {
        const chat = await Chat.findById(chatId);

        const availableFriends = friends.filter(friend => {
            return !chat.members.includes(friend._id);
        });

        return res.status(200).json({
            success: true,
            data: { friends: availableFriends },
        });
    } else {
        return res.status(200).json({
            success: true,
            data: { friends },
        });
    }

});
