const Message = require("../models/message");

const createMessage = async (data) => {
  const message = new Message(data);
  return await message.save();
};

const getMessagesByConversation = async (conversationId, limit = 50) => {
  return await Message.find({ conversation_id: conversationId })
    .populate("sender_id", "username profile_photo")
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();
};

const updateMessageStatus = async (messageId, status) => {
  return await Message.findByIdAndUpdate(messageId, { status }, { new: true });
};

const getUnreadMessages = async (conversationId, userId) => {
  return await Message.find({
    conversation_id: conversationId,
    sender_id: { $ne: userId },
    status: { $ne: "read" },
  }).lean();
};

module.exports = {
  createMessage,
  getMessagesByConversation,
  updateMessageStatus,
  getUnreadMessages,
};
