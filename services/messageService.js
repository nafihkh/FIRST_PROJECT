const conversationRepo = require("../repository/conversationRepository");
const jwt = require("jsonwebtoken");


const getUserChats = (userId) => conversationRepo.findByUser(userId).populate("lastMessage").sort({ updatedAt: -1 });
const getConversationMessages = (conversationId) => conversationRepo.findMessagesByConversation(conversationId);


const startConversation = async (token, targetUserId, targetUserType, title) => {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const loggedUserId = decoded.userId;
const loggedUserType = decoded.role;


const existing = await conversationRepo.findExisting(loggedUserId, targetUserId);
if (existing) return existing;


return conversationRepo.createConversation({
title,
participants: [
{ participantId: loggedUserId, participantType: loggedUserType },
{ participantId: targetUserId, participantType: targetUserType }
]
});
};


const sendMessage = async (token, conversationId, message) => {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const senderId = decoded.userId;
const senderType = decoded.role;


const conversation = await conversationRepo.findById(conversationId);
const receiver = conversation.participants.find(p => p.participantId.toString() !== senderId);


return conversationRepo.createMessage({
conversationId,
senderId,
senderType,
receiverId: receiver.participantId,
receiverType: receiver.participantType,
message,});
};
module.exports = { getUserChats, getConversationMessages, startConversation, sendMessage };