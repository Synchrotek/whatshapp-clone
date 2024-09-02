const { v4: uuidV4 } = require('uuid');
const socketEvents = require("../constants/socketEvents");
const { Message } = require('../models/message.models');

const userSocketIds = new Map();

const getSockets = (users) => {
    const sockets = users.map(user => {
        return userSocketIds.get(user._id.toString());
    });
    return sockets;
}

const socketHandle = (io) => {
    io.on('connection', (socket) => {
        const user = {
            _id: "user1",
            name: "user 1"
        };
        userSocketIds.set(user._id.toString(), socket._id);
        console.log("New client connected with id:", socket.id)

        socket.on(socketEvents.NEW_MESSAGE, async ({ chatId, members, message }) => {
            const msgForRealtime = {
                content: message,
                _id: uuidV4(),
                sender: {
                    _id: user._id,
                    name: user.name
                },
                chat: chatId,
                createdAt: new Date().toString(),
            };

            const msgForDB = {
                content: message,
                sender: user._id,
                chat: chatId
            };

            const membersSocket = getSockets(members);
            io.to(membersSocket).emit(socketEvents.NEW_MESSAGE, {
                chatId, message: msgForRealtime
            });
            io.to(membersSocket).emit(socketEvents.NEW_MESSAGE_ALERT, { chatId });

            console.log("New Message:", msgForRealtime);

            try {
                await Message.create(msgForDB);
            } catch (error) {
                console.error("Message save error:", error);
            }
        });

        // Handle disconnection of an socketId -------------------------
        socket.on('disconnecting', () => {
            const rooms = [...socket.rooms];
            rooms.forEach((roomId) => {
                socket.in(roomId).emit('disconnected', {
                    socketId: socket.id,
                    username: userSocketMap[socket.id],
                });
            })
            socket.leave();
        })

        // Handle disconnections ----------------------------------------
        socket.on('disconnect', () => {
            console.log("user disconnected with id:", socket.id);
            userSocketIds.delete(user._id.toString());
        });
    });
};

module.exports = socketHandle