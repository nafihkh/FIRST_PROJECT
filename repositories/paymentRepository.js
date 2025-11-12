
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

const countAll = () => Invoice.countDocuments({status: "unpaid"});

const getPendingPayments = async (workerId) => {
  return Invoice.find({
    worker_id: workerId,
    status: "unpaid",
  });
};

const getTotalEarnings = async (workerId) => {
  const result = await Invoice.aggregate([
    { $match: { worker_id: workerId, status: "Paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total || 0;
};

const getMonthlyEarnings = async (workerId) => {
  const currentMonth = new Date().getMonth() + 1;

  const result = await Invoice.aggregate([
    { $match: { worker_id: workerId, status: "Paid" } },
    {
      $project: {
        amount: 1,
        month: { $month: "$createdAt" },
      },
    },
    { $match: { month: currentMonth } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return result[0]?.total || 0;
};


// Payments (actual money records)
const createPayment = (data) => Payment.create(data);

const findPaymentsByUser = (userId) =>
  Payment.find({ user_id: userId }).populate("task_id").sort({ createdAt: -1 });

const findPaymentsByWorker = (workerId) =>
  Payment.find({ worker_id: workerId }).populate("task_id").sort({ createdAt: -1 });

const countCompletedPaymentsByUser = (userId) =>
  Payment.countDocuments({ user_id: userId, status: "completed" });

const sumCompletedPaymentsAmountByUser = async (userId) => {
  const res = await Payment.aggregate([
    { $match: { user_id: userId, status: "completed" } },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);
  return res[0]?.totalAmount || 0;
};

const countCompletedPaymentsByWorker = (workerId) =>
  Payment.countDocuments({ worker_id: workerId, status: "completed" });

const sumCompletedPaymentsAmountByWorker = async (workerId) => {
  const res = await Payment.aggregate([
    { $match: { worker_id: workerId, status: "completed" } },
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);
  return res[0]?.totalAmount || 0;
};

module.exports = {
  createPayment,
  findPaymentsByUser,
  findPaymentsByWorker,
  countCompletedPaymentsByUser,
  sumCompletedPaymentsAmountByUser,
  countCompletedPaymentsByWorker,
  sumCompletedPaymentsAmountByWorker,
  countAll,
  getTotalEarnings ,
  getPendingPayments,
  getMonthlyEarnings,
};
