const mongoose = require('mongoose');

const fRequestSchema = new mongoose.Schema({
    status: {
        type: String,
        default: "pending",
        enum: ["accepted", "pending", "rejected"]
    },
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const FRequest = mongoose.models.FRequest ||
    mongoose.model("FRequest", fRequestSchema);

module.exports = { FRequest };