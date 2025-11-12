const Conversation = require("../models/Conversation");
const Message = require("../models/message");


const findById = (id) => Conversation.findById(id).populate("task_id", "progress");
;
const findByUser = (userId) => Conversation.find({ "participants.participantId": userId }).populate("task_id", "progress");
const findExisting = (loggedUserId, targetUserId) => Conversation.findOne({
"participants.participantId": { $all: [loggedUserId, targetUserId] }
});
const createConversation = (data) => new Conversation(data).save();


const findMessagesByConversation = (conversationId) => Message.find({ conversationId }).sort({ createdAt: 1 });
const createMessage = (data) => Message.create(data);



const deleteConversationById = (conversationId) =>
  Conversation.findByIdAndDelete(conversationId);

const deleteMessagesByConversationId = (conversationId) =>
  Message.deleteMany({ conversationId });


module.exports = {
findById,
findByUser,
findExisting,
createConversation,
findMessagesByConversation,
createMessage,
deleteConversationById,
deleteMessagesByConversationId,
};