const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: String,
    attachments: {
        public_id: {
            type: String,
            // required: true,
        },
        url: {
            type: String,
            // required: true,
        }
    },
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    chat: {
        type: mongoose.Types.ObjectId,
        ref: "Chat",
        required: true
    }
}, { timestamps: true });

const Message = mongoose.models.Message ||
    mongoose.model("Message", messageSchema);

module.exports = { Message };