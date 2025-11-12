// controllers/messageController.js
const {
  createConversationService,
  getConversationMessagesService,
  sendMessageService,
  getUserConversationsService,
  getMessagesByConversationUserService,
  getUserConversationsWorkerService,
  getMessagesByConversationWorkerService,
  deleteConversationWithMessages,
} = require("../services/messageService");

// KEEP NAME: exports.createConversation
exports.createConversation = async (req, res) => {
  try {
    const result = await createConversationService({
      token: req.cookies.token,
      jwtSecret: process.env.JWT_SECRET,
      params: {
        userId: req.params.userId,
        type: req.params.type,
        title: req.params.title,
        taskId: req.params.taskId,
      },
    });
    return res.redirect(result.redirectTo);
  } catch (error) {
    console.error("Error creating conversation:", error);
    const status = error.status || 500;
    return res.status(status).send(status === 401 ? "Not logged in" : "Server Error");
  }
};

// KEEP NAME: exports.getConversationMessages (worker)
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await getConversationMessagesService({ conversationId });
    return res.render(result.view, result.data);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message || "Server Error");
  }
};

// KEEP NAME: exports.sendMessage
exports.sendMessage = async (req, res) => {
  try {
    const result = await sendMessageService({
      token: req.cookies.token,
      jwtSecret: process.env.JWT_SECRET,
      body: req.body,
    });
    return res.redirect(result.redirectTo);
  } catch (error) {
    console.error("Error sending message:", error);
    const status = error.status || 500;
    return res.status(status).send(status === 401 ? "Not logged in" : error.message || "Server Error");
  }
};

// KEEP NAME: exports.getUserConversations (user)
exports.getUserConversations = async (req, res) => {
  try {
    const result = await getUserConversationsService({ user: req.user });
    return res.render(result.view, result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error loading conversations");
  }
};

// KEEP NAME: exports.getMessagesByConversationUser (user)
exports.getMessagesByConversationUser = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const result = await getMessagesByConversationUserService({
      user: req.user,
      conversationId,
    });
    return res.render(result.view, result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

// KEEP NAME: exports.getUserConversationsworker (worker)
exports.getUserConversationsworker = async (req, res) => {
  try {
    const result = await getUserConversationsWorkerService({ user: req.user });
    return res.render(result.view, result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error loading conversations");
  }
};

// KEEP NAME: exports.getMessagesByConversationworker (worker)
exports.getMessagesByConversationworker = async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const result = await getMessagesByConversationWorkerService({
      user: req.user,
      conversationId,
    });
    return res.render(result.view, result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteConversationWithMessages(id);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete conversation" });
  }
};