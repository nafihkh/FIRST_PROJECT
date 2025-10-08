const messageService = require("../services/messageService");

const sendMessage = async (req, res) => {
  try {
    const { conversation_id, sender_id, message } = req.body;
    const result = await messageService.sendMessage({ conversation_id, sender_id, message });
    res.status(201).json({ success: true, message: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const messages = await messageService.getConversationMessages(conversation_id);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { message_id } = req.params;
    const updated = await messageService.markMessageAsRead(message_id);
    res.status(200).json({ success: true, message: updated });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const getUnread = async (req, res) => {
  try {
    const { conversation_id, user_id } = req.params;
    const unread = await messageService.getUnreadMessages(conversation_id, user_id);
    res.status(200).json({ success: true, unread });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  getUnread,
};
