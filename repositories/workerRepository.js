const User = require("../models/User");
const Task = require("../models/Tasks");


const getAllWorkers = () =>
  User.find({ role: "worker" })
    .select("username email profile_photo status accessibility last_active")
    .sort({ created_at: -1 });

const findWorkerById = (id) => User.findOne({ _id: id, role: "worker" });

const deleteWorker = (id) => User.findOneAndDelete({ _id: id, role: "worker" });

const updateWorker = (id, updates) =>
  User.findOneAndUpdate({ _id: id, role: "worker" }, updates, { new: true });

const toggleWorkerBlock = async (id) => {
  const worker = await User.findOne({ _id: id, role: "worker" });
  if (!worker) return null;

  worker.accessibility = !worker.accessibility;
  return worker.save();
};


const getTasksByWorker = (workerId) =>
  Task.find({ worker_id: workerId }).populate("user_id", "username profile_photo");

const findPendingWorkers = () => User.find({ role: "user", worker_status: false });

const approveWorker = (id) =>
  User.findByIdAndUpdate(id, { role: "worker", worker_status: true });

const rejectWorker = (id) =>
  User.findByIdAndUpdate(id, { $unset: { worker_status: "" } });

module.exports = {
  getAllWorkers,
  findWorkerById,
  deleteWorker,
  updateWorker,
  toggleWorkerBlock,
  getTasksByWorker,
  findPendingWorkers,
  approveWorker,
  rejectWorker,
};