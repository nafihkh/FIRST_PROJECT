// repositories/invoicesRepository.js
const Invoice = require("../models/Invoice");

// Basic getters
const findInvoiceById = (id, options = {}) => {
  let q = Invoice.findById(id);
  if (options.populateUserFull) q = q.populate("user_id", "username email phone");
  if (options.populateWorkerFull) q = q.populate("worker_id", "username email phone jobtittle");
  if (options.populateTaskTitle) q = q.populate("task_id", "title");
  if (options.populateWorkerRef) q = q.populate("worker_id");
  if (options.populateUserRef) q = q.populate("user_id");
  return q.then((doc) => {
    if (!doc) return null;
    if (options.ensureWorker && String(doc.worker_id) !== String(options.ensureWorker)) return null;
    return doc;
  });
};

const findInvoicesByWorker = (workerId, { populateUser = false, sortDesc = false } = {}) => {
  let q = Invoice.find({ worker_id: workerId });
  if (populateUser) q = q.populate("user_id", "username");
  if (sortDesc) q = q.sort({ createdAt: -1 });
  return q;
};

const findInvoicesByUser = (userId, { populateWorker = false, sortDesc = false } = {}) => {
  let q = Invoice.find({ user_id: userId });
  if (populateWorker) q = q.populate("worker_id", "username");
  if (sortDesc) q = q.sort({ createdAt: -1 });
  return q;
};

const findAllInvoices = ({ populateUser = false, sortDesc = false } = {}) => {
  let q = Invoice.find();
  if (populateUser) q = q.populate("user_id", "username");
  if (sortDesc) q = q.sort({ createdAt: -1 });
  return q;
};

const findInvoicesByTaskIdsSelectOnlyTaskId = (taskIds) =>
  Invoice.find({ task_id: { $in: taskIds } }).select("task_id");

const createInvoice = (data) => new Invoice(data).save();

const deleteInvoiceById = (id) => Invoice.deleteOne({ _id: id });

const countInvoicesBy = (match) => Invoice.countDocuments(match);

// Generic sum helper
const aggregateSum = async ({ match, field }) => {
  const pipeline = [
    { $match: match },
    { $group: { _id: null, total: { $sum: `$${field}` } } },
  ];
  const res = await Invoice.aggregate(pipeline);
  return res[0]?.total || 0;
};

// Weekly revenue: paid invoices between start/end
const aggregatePaidBetweenForRevenue = ({ start, end }) =>
  Invoice.aggregate([
    {
      $match: {
        status: "Paid",
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalRevenue: { $sum: "$total_amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

// Sum by status and field
const aggregateSumByStatusField = async ({ status, match = {}, field }) => {
  const filter = { ...match, status };
  return aggregateSum({ match: filter, field });
};

const aggregateSumPlatformFeePaid = async () => {
  return aggregateSumByStatusField({ status: "Paid", field: "platform_fee" });
};

module.exports = {
  findInvoiceById,
  findInvoicesByWorker,
  findInvoicesByUser,
  findAllInvoices,
  findInvoicesByTaskIdsSelectOnlyTaskId,
  createInvoice,
  deleteInvoiceById,
  countInvoicesBy,
  aggregateSum,
  aggregatePaidBetweenForRevenue,
  aggregateSumByStatusField,
  aggregateSumPlatformFeePaid,
};
