const mongoose = require('mongoose');
const reportSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  summary: String,
  created_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Report', reportSchema);