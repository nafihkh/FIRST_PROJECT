const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
    user_id:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    worker_id:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    title:{type:String, required: true},
    description:{type:String, required: true},
    photo:{type:String},
    amount:{type:Number, required: true},
    status:{type:String, enum: ["active", "hidden"], default: 'active'},
    progress: { type: String, enum: ["Not Taken", "InProgress", "Submitted", "Approved","Completed"], default: "Not Taken" },
    created_at:{type: Date, default: Date.now},
    duration:{type:String, required: true},
    deadline:{type: Date, required: true},
    response: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rating: { type: Number, default: 0 },
    razorpay_order_id: String,
    razorpay_payment_id: String,
})
module.exports = mongoose.model('Task', taskSchema);