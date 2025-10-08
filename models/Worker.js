// models/Worker.js
const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: { type: String, required: true },
  skills: [{ type: String, required: true }],
  total_work_done: { type: Number, default: 0 },
  work_in_Progress: { type: Number, default: 0 },
  total_money_saved: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }]
});

module.exports = mongoose.model('Worker', workerSchema);
