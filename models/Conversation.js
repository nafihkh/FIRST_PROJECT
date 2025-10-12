const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    participants: [
      {
        participantId: { type: mongoose.Schema.Types.ObjectId, required: true },
        participantType: { type: String, enum: ["user", "worker"], required: true },
      },
    ],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
