const User = require("../models/User");
const Task = require("../models/Tasks");
const Worker = require("../models/Worker");
const mongoose = require('mongoose');


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

async function getworkerRatingLast7Days() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  return await Worker.aggregate([
    { $match: { updatedAt: { $gte: sevenDaysAgo }, rating: { $exists: true } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, avgRating: { $avg: "$rating" } } },
    { $sort: { _id: 1 } }
  ]);
}

const createWorkerProfileIfNotExists = async (userId, username = "") => {
  const existingWorker = await Worker.findOne({ user_id: userId });
  if (!existingWorker) {
    await Worker.create({
      user_id: userId,
      username: username,
      skills: [],
      total_work_done: 0,
      work_in_Progress: 0,
      total_money_saved: 0,
      rating: 0,
      cart: []
    });
    console.log("✅ Worker profile created for:", userId);
  }
  return existingWorker;
};
const getAverageRating = async (userId) => {
  const worker = await Worker.findOne({ user_id: userId });
  return worker?.rating || 0;
};

const getTotalReviews = async (userId) => {
  const worker = await Worker.findOne({ user_id: userId });
  return worker?.total_reviews || 0;
};
const getTotalReviewsCount = async (userId) => {
  const worker = await Worker.findOne({ user_id: userId });
  return worker?.total_reviews || 0;
};

// Get overall task completion percentage
const getTaskCompletionRate = async (workerId) => {
  const totalTasks = await Task.countDocuments({ worker_id: workerId });
  const completedTasks = await Task.countDocuments({ 
    worker_id: workerId, 
    progress: "Completed" 
  });

  if (totalTasks === 0) return 0;
  return ((completedTasks / totalTasks) * 100).toFixed(1);
};

// Get average rating from tasks where worker completed work
const getAverageTaskRating = async (workerId) => {
  const result = await Task.aggregate([
    { 
      $match: { 
        worker_id: new mongoose.Types.ObjectId(workerId),
        progress: "Completed",
        rating: { $exists: true, $ne: null, $gt: 0 }
      } 
    },
    { 
      $group: { 
        _id: null, 
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      } 
    }
  ]);

  return result[0]?.avgRating?.toFixed(1) || 0;
};

// Get completed tasks count
const getCompletedTasksCount = async (workerId) => {
  return await Task.countDocuments({ 
    worker_id: workerId, 
    progress: "Completed" 
  });
};

// Get all performance stats at once
const getPerformanceStats = async (userId) => {
  const worker = await Worker.findOne({ user_id: userId });
  if (!worker) return null;

  const workerId = userId;

  const [totalReviews, completionRate, avgRating, completedTasks] = await Promise.all([
    getTotalReviewsCount(userId),
    getTaskCompletionRate(workerId),
    getAverageTaskRating(workerId),
    getCompletedTasksCount(workerId),
  ]);

  return {
    totalReviews,
    successRate: completionRate,
    avgRating,
    completedTasks,
  };
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

  createWorkerProfileIfNotExists,
   getworkerRatingLast7Days,
   getAverageRating,
   getTotalReviews,
    getTotalReviewsCount,
  getTaskCompletionRate,
  getAverageTaskRating,
  getCompletedTasksCount,
  getPerformanceStats,

  
};