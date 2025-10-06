const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
  tasks: [
    {
      task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
      addedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Cart", cartSchema);