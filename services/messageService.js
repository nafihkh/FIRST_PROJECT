// services/messageService.js
const jwt = require("jsonwebtoken");
const conversationRepo = require("../repositories/messageRepository"); // adjust path if needed

// Internal helper: decode token
function decodeTokenOrThrow(token, jwtSecret) {
  if (!token) {
    const err = new Error("Not logged in");
    err.status = 401;
    throw err;
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return {
      userId: decoded.userId,
      role: decoded.role, // "worker" or "user"
    };
  } catch (e) {
    const err = new Error("Invalid token");
    err.status = 401;
    throw err;
  }
}

// Internal helper: find receiver in conversation
function getReceiverFromConversation(conversation, senderId) {
  if (!conversation || !Array.isArray(conversation.participants)) return null;
  return conversation.participants.find(
    (p) => String(p.participantId) !== String(senderId)
  );
}

// Service: create conversation (preserves original behavior: one conversation per task)
async function createConversationService({ token, params, jwtSecret }) {
  const { userId: loggedUserId, role: loggedUserType } = decodeTokenOrThrow(token, jwtSecret);

  const targetUserId = params.userId;
  const targetUserType = params.type;
  const tasktitle = params.title;
  const taskId = params.taskId;

  // Check if conversation already exists for this task id using only repo functions
  // Strategy: fetch all conversations for logged user, then match by task_id
  const myConversations = await conversationRepo.findByUser(loggedUserId);
  const existingConversation = myConversations.find(
    (c) => c.task_id && String(c.task_id) === String(taskId)
  );

  if (existingConversation) {
    return {
      redirectTo: `/${loggedUserType}/messages/${existingConversation._id}`,
    };
  }

  // Create new conversation
  const newConversation = await conversationRepo.createConversation({
    title: tasktitle,
    task_id: taskId,
    participants: [
      { participantId: loggedUserId, participantType: loggedUserType },
      { participantId: targetUserId, participantType: targetUserType },
    ],
  });

  return {
    redirectTo: `/${loggedUserType}/messages/${newConversation._id}`,
  };
}

// Service: get conversation messages (worker view)
async function getConversationMessagesService({ conversationId }) {
  const messages = await conversationRepo.findMessagesByConversation(conversationId);
  const conversation = await conversationRepo.findById(conversationId);

  return {
    view: "worker/messages",
    data: { messages, conversation },
  };
}

// Service: send a message
async function sendMessageService({ token, body, jwtSecret }) {
  const { userId: senderId, role: senderType } = decodeTokenOrThrow(token, jwtSecret);
  const { conversationId, message } = body;

  const conversation = await conversationRepo.findById(conversationId);
  if (!conversation) {
    const err = new Error("Conversation not found");
    err.status = 404;
    throw err;
  }

  const receiver = getReceiverFromConversation(conversation, senderId);
  if (!receiver) {
    const err = new Error("Receiver not found");
    err.status = 400;
    throw err;
  }

  await conversationRepo.createMessage({
    conversationId,
    senderId,
    senderType,
    receiverId: receiver.participantId,
    receiverType: receiver.participantType,
    message,
  });

  return {
    redirectTo: `/${senderType}/messages/${conversationId}`,
  };
}

// Service: list conversations for user (user view)
async function getUserConversationsService({ user }) {
  const conversations = await conversationRepo.findByUser(user._id);
  return {
    view: "user/messages",
    data: {
      conversations,
      messages: [],
      currentConv: null,
      title: "Messages",
      activePage: "messages",
    },
  };
}

// Service: messages by conversation (user view)
async function getMessagesByConversationUserService({ user, conversationId }) {
  const messages = await conversationRepo.findMessagesByConversation(conversationId);
  const conversations = await conversationRepo.findByUser(user._id);
  const currentConv = await conversationRepo.findById(conversationId);

  return {
    view: "user/messages",
    data: {
      conversations,
      messages,
      currentConv,
      title: "Messages",
      activePage: "messages",
    },
  };
}

// Service: list conversations for worker (worker view)
async function getUserConversationsWorkerService({ user }) {
  const conversations = await conversationRepo.findByUser(user._id);
  return {
    view: "worker/messages",
    data: {
      conversations,
      messages: [],
      currentConv: null,
      title: "Messages",
      activePage: "messages",
    },
  };
}

// Service: messages by conversation (worker view)
async function getMessagesByConversationWorkerService({ user, conversationId }) {
  const messages = await conversationRepo.findMessagesByConversation(conversationId);
  const conversations = await conversationRepo.findByUser(user._id);
  const currentConv = await conversationRepo.findById(conversationId);

  return {
    view: "worker/messages",
    data: {
      conversations,
      messages,
      currentConv,
      title: "Messages",
      activePage: "messages",
    },
  };
}
const deleteConversationWithMessages = async (conversationId) => {
  // delete messages
  await conversationRepo.deleteMessagesByConversationId(conversationId);

  // delete the conversation
  await conversationRepo.deleteConversationById(conversationId);

  return { success: true, message: "Conversation and messages deleted" };
};

module.exports = {
  createConversationService,
  getConversationMessagesService,
  sendMessageService,
  getUserConversationsService,
  getMessagesByConversationUserService,
  getUserConversationsWorkerService,
  getMessagesByConversationWorkerService,
  deleteConversationWithMessages,
};
