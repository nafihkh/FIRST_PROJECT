const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, refPath: "senderType" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, refPath: "receiverType" },
    senderType: { type: String, enum: ["user", "worker"], required: true },
    receiverType: { type: String, enum: ["user", "worker"], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
