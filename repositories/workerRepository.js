const User = require("../models/User");
const Task = require("../models/Tasks");
const Worker = require("../models/Worker");


const getAllWorkers = () =>
  User.find({ role: "worker" })
    .select("username email profile_photo status accessibility last_active")
    .sort({ created_at: -1 });

const findWorkerById = (id) => User.findOne({ _id: id, role: "worker" });

const findByUserId = (userId) => Worker.findOne({ user_id: userId });

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

const createWorkerProfile = (data) => new Worker(data).save();

const getWorkerProfile = (userId) =>
  Worker.findOne({ user_id: userId }).populate("user_id", "username email profile_photo");

const updateWorkerProfile = (userId, updates) =>
  Worker.findOneAndUpdate({ user_id: userId }, updates, { new: true });

const getSkills = async (userId) => {
  const worker = await workerRepository.findByUserId(userId);
  if (!worker) return null;
  return worker.skills;
};

const addSkill = async (userId, skill) => {
 
  const worker = await workerRepository.findByUserId(userId);
  if (!worker) return null;

  if (worker.skills.includes(skill)) return "exists";

  worker.skills.push(skill);

  await worker.save();

  return worker.skills;
};

const removeSkill = async (userId, skill) => {
  const worker = await workerRepository.findByUserId(userId);
  if (!worker) return null;

  worker.skills = worker.skills.filter(s => s !== skill);

  await worker.save();

  return worker.skills;
};

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
  findByUserId,

  createWorkerProfile,
  getWorkerProfile,
  updateWorkerProfile,

  getSkills,
  addSkill,
  removeSkill,

  
};