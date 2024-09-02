const { TryCatch, ErrorResponse: ErrResp } = require("../middlewares/error.js");
const { Chat } = require("../models/chat.models.js");
const { Message } = require('../models/message.models.js');
const { emitEvent } = require("../utils/socketUtils.js");
const socketEvents = require('../constants/socketEvents.js');
const { getOtherMember } = require("../lib/helper.js");
const { User } = require("../models/user.models.js");
const { deleteFilesFromCloudinary } = require("../utils/cloudinary.js");

exports.newGroupChat = TryCatch(async (req, res) => {
    const { name, members } = req.body;
    console.log("req.user:", req.userId);
    if (members.length < 2) {
        return res.status(400).json({
            success: false,
            message: "Group must have at least 2 members."
        });
    }

    const allMembers = [...members, req.userId];
    const allUniqueMembers = [...new Set(allMembers)];

    console.log("allUniqueMembers:", allUniqueMembers);

    const isGroupChat = allUniqueMembers.length > 2;

    let chatName = name;
    if (!isGroupChat) {
        const otherMember = await getOtherMember(allUniqueMembers, req.userId);
        chatName = otherMember.name;
    }

    await Chat.create({
        name: chatName,
        groupChat: isGroupChat,
        creator: req.userId,
        members: allUniqueMembers
    });

    emitEvent(req, socketEvents.ALERT, allMembers, `Welcome to ${name} group`);
    emitEvent(req, socketEvents.REFETCH_CHATS, members)

    return res.status(201).json({
        success: true,
        message: `${isGroupChat ? 'Group' : 'Chat'} creted`
    });
});

exports.getMyChats = TryCatch(async (req, res) => {
    console.log("req.user:", req.userId);

    const chats = await Chat.find({ members: req.userId })
        .populate(
            "members",
            "name avatar"
        );

    const transformedChats = await chats.map(async (chat) => {
        const otherMember = await getOtherMember(chat.members, req.userId);
        return {
            _id: chat._id,
            name: chat.groupChat ?
                chat.name : otherMember.name,
            groupChat: chat.groupChat,
            avatar: chat.groupChat ?
                chat.members.slice(0, 3).map(member => member.avatar.url)
                : [otherMember.avatar.url],
            members: chat.members.reduce((prev, curr) => {
                if (curr._id.toString !== req.userId.toString()) {
                    prev.push(curr._id);
                }
                return prev;
            }, []),
        }
    });

    return res.status(200).json({
        success: true,
        chats: await Promise.all(transformedChats),
    });
});

// exports.getMyGroups = 

exports.addMembers = TryCatch(async (req, res) => {

    const { chatId, members } = req.body;

    if (!members || members.length < 1) {
        ErrResp(res, 400, "Please provide members.");
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return ErrResp(res, 400, "Chat not found.");
    if (!chat.groupChat) {
        return ErrResp(res, 400, "This is not a group chat.");
    }
    if (chat.creator.toString() !== req.userId.toString()) {
        return ErrResp(res, 403, "Unauthorized to add members.");
    }

    const allNewMembersPromise = members.map((i) => {
        return User.findById(i, "name")
    });
    const allNewMembers = await Promise.all(allNewMembersPromise);
    const uniqueMembers = allNewMembers
        .filter(i => !chat.members.includes(i._id.toString()))
        .map(i => i._id);

    chat.members.push(...uniqueMembers);

    if (chat.members.length > 100) {
        return ErrResp(res, 403, "Group limit reached.");
    }

    await chat.save();

    const allUsersName = allNewMembers
        .map(i => i.name)
        .join(",");

    emitEvent(req, socketEvents.ALERT, chat.members,
        `${allUsersName} has been added in the group.`
    );
    emitEvent(req, socketEvents.REFETCH_CHATS, chat.members);

    res.status(200).json({
        success: true,
        message: "Members added successfully"
    });
});

exports.removeMember = TryCatch(async (req, res) => {
    const { chatId, memberId } = req.body;

    const [chat, toBeRemovedUser] = await Promise.all([
        Chat.findById(chatId),
        User.findById(memberId, "name"),
    ]);

    if (!chat) return ErrResp(res, 404, "Chat not found.");
    if (!chat.groupChat) {
        return ErrResp(res, 400, "This is not a group chat.");
    }
    if (chat.creator.toString() !== req.userId.toString()) {
        return ErrResp(res, 403, "Unauthorized to remove members.");
    }
    if (chat.members.length <= 3) {
        return ErrResp(res, 400, "Group must have at least 3 members.");
    }

    chat.members = chat.members.filter(member => {
        return member.toString() !== memberId.toString()
    });

    await chat.save();
    emitEvent(req, socketEvents.ALERT, chat.members,
        `${toBeRemovedUser.name} has been removed from the group.`
    );
    emitEvent(req, socketEvents.REFETCH_CHATS, chat.members);

    res.status(200).json({
        success: true,
        message: "Member removed successfully"
    });
});

// User leaving a group ------------------------------
exports.leaveGroup = TryCatch(async (req, res) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) return ErrResp(res, 404, "Chat not found.");
    if (!chat.groupChat) {
        return ErrResp(res, 400, "This is not a group chat.");
    }

    const remainingMembers = chat.members.filter(member => {
        return member.toString() !== req.userId.toString();
    });

    if (remainingMembers.length < 3) {
        return ErrResp(res, 400, "Group must have at least 3 members.");
    }

    if (chat.creator.toString() === req.userId.toString()) {
        const randomNumber = Math.floor(
            Math.random() * remainingMembers.length
        );
        const newCreator = remainingMembers[randomNumber];
        chat.creator = newCreator;
    }

    chat.members = remainingMembers;

    const [fetchedUser] = await Promise.all([
        User.findById(req.userId, "name"),
        chat.save()
    ]);

    emitEvent(req, socketEvents.ALERT, chat.members,
        `${fetchedUser.name} has left the group.`
    );

    res.status(200).json({
        success: true,
        message: "Member removed successfully"
    });
});

exports.sendAttachments = TryCatch(async (req, res) => {
    const { chatId } = req.body;

    const [chat, me] = await Promise.all([
        Chat.findById(chatId),
        User.findById(req.userId, "name")
    ]);

    if (!chat) return ErrResp(res, 404, "Chat not found.");
    const files = req.files || [];
    if (files.length < 1) return ErrResp(res, 400, "Please provide attachments.");
    if (files.length > 5) return ErrResp(res, 400, "sorry, can't be upload more than 5 files at once.");

    // upload files here

    const attachments = [];

    const messageForDB = {
        content: "",
        attachments,
        sender: me._id,
        chat: chatId
    };
    const messageForRealTime = {
        ...messageForDB,
        sender: {
            _id: me._id,
            name: me.name,
        }
    };

    const message = await Message.create(messageForDB);

    emitEvent(req, socketEvents.NEW_ATTACHMENT, chat.members, {
        message: messageForRealTime,
        chatId
    });
    emitEvent(req, socketEvents.NEW_MESSAGE_ALERT, chat.members, { chatId });

    res.status(200).json({
        success: true,
        message
    });
});

exports.getMessages = TryCatch(async (req, res) => {
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [messages, totalMessagesCount] = await Promise.all([
        Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("sender", "name")
            .lean(),
        Message.countDocuments({ chat: chatId })
    ]);

    const totalPages = Math.ceil(totalMessagesCount / limit) || 0;

    res.status(200).json({
        success: true,
        data: {
            messages: messages.reverse(),
            totalPages
        }
    });
});

exports.getChatDetails = TryCatch(async (req, res) => {
    const { chatId } = req.params;
    if (req.query.populate === "true") {
        const chat = await Chat.findById(chatId)
            .populate("members", "name avatar")
            .lean();
        if (!chat) return ErrResp(res, 404, "Chat not found.");

        chat.members = chat.members.map(({ _id, name, avatar }) => ({
            _id, name, avatar: avatar.url
        }));

        return res.status(200).json({
            success: true,
            data: chat,
        })
    } else {
        const chat = await Chat.findById(chatId);
        if (!chat) return ErrResp(res, 404, "Chat not found.");

        return res.status(200).json({
            success: true,
            data: chat,
        })
    }
});

exports.renameGroup = TryCatch(async (req, res) => {
    const { chatId } = req.params;
    const { newName } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) return ErrResp(res, 404, "Chat not found.");
    if (!chat.groupChat) return ErrResp(res, 400, "Not ta group chat.");
    if (chat.creator.toString() !== req.userId.toString()) {
        return ErrResp(res, 403, "Not authorized to rename this group.");
    };

    chat.name = newName;

    await chat.save();

    emitEvent(req, socketEvents.NEW_MESSAGE_ALERT, chat.members);

    res.status(200).json({
        success: true,
        message: "Group renamed successfully."
    });
});

exports.deleteGroup = TryCatch(async (req, res) => {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) return ErrResp(res, 404, "Chat not found.");
    if (!chat.groupChat) return ErrResp(res, 400, "Not ta group chat.");
    if (chat.creator.toString() !== req.userId.toString() ||
        !chat.members.includes(req.userId.toString())) {
        return ErrResp(res, 403, "Not authorized to delete this group.");
    };

    const members = chat.members;

    // Here we have to delete all messages as well as attachments from cloudinary.

    const messagesWitAttachments = await Message.find({
        chat: chatId,
        attachments: { $exists: true, $ne: [] },
    });

    const public_ids = [];

    messagesWitAttachments.forEach(({ attachments }) => {
        return attachments.forEach(({ public_id }) => {
            return public_ids.push(public_id);
        });
    });

    await Promise.all([
        deleteFilesFromCloudinary(public_ids),
        chat.deleteOne(),
        Message.deleteMany({ chat: chatId })
    ]);

    emitEvent(req, socketEvents.REFETCH_CHATS, members);

    res.status(200).json({
        success: true,
        message: "Group deleted successfully."
    });
});