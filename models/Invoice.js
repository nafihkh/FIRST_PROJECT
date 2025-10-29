const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { 
      type: Number,
      required: true,
    },
    platform_fee: {
      type: Number,
      required: true,
      default: 0,
    },
    total_amount: {
      type: Number,
      required: true, 
    },
    status: {
      type: String,
      enum: ["Paid", "unpaid", "Cancelled"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
