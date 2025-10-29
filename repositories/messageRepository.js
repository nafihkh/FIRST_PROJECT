const Conversation = require("../models/Conversation");
const Message = require("../models/message");


const findById = (id) => Conversation.findById(id);
const findByUser = (userId) => Conversation.find({ "participants.participantId": userId });
const findExisting = (loggedUserId, targetUserId) => Conversation.findOne({
"participants.participantId": { $all: [loggedUserId, targetUserId] }
});
const createConversation = (data) => new Conversation(data).save();


const findMessagesByConversation = (conversationId) => Message.find({ conversationId }).sort({ createdAt: 1 });
const createMessage = (data) => Message.create(data);


module.exports = {
findById,
findByUser,
findExisting,
createConversation,
findMessagesByConversation,
createMessage,
};