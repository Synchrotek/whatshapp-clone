const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    groupChat: {
        type: Boolean,
        default: false
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    members: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ]
}, { timestamps: true });

const Chat = mongoose.models.Chat ||
    mongoose.model("Chat", chatSchema);

module.exports = { Chat };