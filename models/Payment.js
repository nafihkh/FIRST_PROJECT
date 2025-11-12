const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    task_id:{type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true},
    user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    invoice_id:{type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true},
    worker_id:{type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true},
    amount:{type:Number, required: true},
    status:{type:String, enum: ['pending', 'completed', 'failed'], default: 'pending'},
    created_at:{type: Date, default: Date.now},

});
module.exports = mongoose.model('Payment', paymentSchema);