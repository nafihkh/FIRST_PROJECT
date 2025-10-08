const messageRepository = require("../repositories/messageRepository");
const Notification = require("../models/Notification");
const Conversation = require("../models/Conversation");
const ConversationParticipant = require("../models/ConversationParticipant");

const sendMessage = async ({ conversation_id, sender_id, message }) => {
  const conversation = await Conversation.findById(conversation_id);
  if (!conversation) throw new Error("Conversation not found");

  const newMessage = await messageRepository.createMessage({
    conversation_id,
    sender_id,
    message,
  });

  // Notify other participants
  const participants = await ConversationParticipant.find({
    conversation_id,
    user_id: { $ne: sender_id },
  });

  for (const participant of participants) {
    await Notification.create({
      user_id: participant.user_id,
      title: "New Message",
      description: "You have a new message in a conversation.",
    });
  }

  return newMessage;
};

const getConversationMessages = async (conversation_id, limit = 50) => {
  return await messageRepository.getMessagesByConversation(conversation_id, limit);
};

const markMessageAsRead = async (messageId) => {
  return await messageRepository.updateMessageStatus(messageId, "read");
};

const getUnreadMessages = async (conversation_id, user_id) => {
  return await messageRepository.getUnreadMessages(conversation_id, user_id);
};

module.exports = {
  sendMessage,
  getConversationMessages,
  markMessageAsRead,
  getUnreadMessages,
};
