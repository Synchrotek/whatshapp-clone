const { faker, simpleFaker } = require('@faker-js/faker');
const { User } = require('../models/user.models.js');
const { Chat } = require('../models/chat.models.js');
const { TryCatch } = require('../middlewares/error.js');
const { Message } = require('../models/message.models.js');

exports.createSampleSingleChats = async (chatCount) => {
    try {
        const users = await User.find().select("_id");

        const chatPromise = [];

        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                chatPromise.push(
                    Chat.create({
                        name: faker.lorem.words(2),
                        members: [users[i], users[j]],
                    })
                );
            }
        }
    } catch (error) {
        console.log("createSampleSingleChats ERROR:", error);
        process.exit(1);
    }
};

exports.createSampleGroupChats = async (chatCount) => {
    try {
        const users = await User.find().select("_id");

        const chatPromise = [];

        for (let i = 0; i < chatCount; i++) {
            const numMembers = simpleFaker.number.int({
                min: 3, max: users.length
            });
            const members = [];

            for (let j = 0; j < numMembers; j++) {

                const randomIndex = Math.floor(Math.random() * users.length);
                const randomUser = users[randomIndex];

                if (!members.includes(randomUser)) {
                    members.push(randomUser);
                }
            }

            const chat = Chat.create({
                groupChat: true,
                name: faker.lorem.words(1),
                members,
                creator: members[0],
            });
            await Promise.all(chatPromise);

            console.log("Chats created successfully");
            process.exit();
        }
    } catch (error) {
        console.log("createSampleGroupChats ERROR:", error);
        process.exit(1);
    }
};

exports.creteMessages = async (numMessages) => {
    try {
        const users = await User.find().select("_id");
        const chats = await Chat.find().select("_id");

        const messagePromise = [];

        for (let i = 0; i < numMessages; i++) {
            const randomUsers = users[Math.floor(Math.random() * users.length)];
            const randomChats = chats[Math.floor(Math.random() * users.length)];

            messagePromise.push(
                Message.create({
                    chat: randomChats,
                    sender: randomUsers,
                    content: faker.lorem.sentence()
                })
            );
        }
        await Promise.all(messagePromise);

        console.log("Messages created successfully");
        process.exit();
    } catch (error) {
        console.log("creteMessages ERROR:", error);
        process.exit(1);
    }
}

exports.creteMessagesInAChat = async (chatId, numMessages) => {
    try {
        const users = await User.find().select("_id");

        const messagePromise = [];

        for (let i = 0; i < numMessages; i++) {
            const randomUsers = users[Math.floor(Math.random() * users.length)];

            messagePromise.push(
                Message.create({
                    chat: chatId,
                    sender: randomUsers,
                    content: faker.lorem.sentence()
                })
            );
        }
        await Promise.all(messagePromise);

        console.log("Messages created successfully");
        process.exit();
    } catch (error) {
        console.log("creteMessagesInAChat ERROR:", error);
        process.exit(1);
    }
}