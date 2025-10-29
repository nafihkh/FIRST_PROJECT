
const Invoice = require("../models/Invoice");

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

module.exports = { 
    countAll,
    getTotalEarnings ,
    getPendingPayments,
    getMonthlyEarnings,
    
};