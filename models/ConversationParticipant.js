const mongoose = require('mongoose');

const conversationParticipantSchema = new mongoose.Schema({
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'helper', 'admin'],
        default: 'user'
    },
    joined_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ConversationParticipant', conversationParticipantSchema);
