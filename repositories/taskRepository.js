const Tasks = require("../models/Tasks");
const Worker = require('../models/Worker');
const mongoose = require('mongoose');
const Report = require("../models/report");

const countAll = () => Tasks.countDocuments({ progress: "Not Taken" });
const countCompleted = () => Tasks.countDocuments({ progress: "Completed" });

const getAll = () =>
  Tasks.find()
    .sort({ createdAt: -1 })
    .populate("user_id", "username profile_photo");

const getAllReports = () =>
  Report.find()
    .sort({ createdAt: -1 })
    .populate("created_by", "username")
    .populate("task_id", "title")
    .populate({
      path: "task_id",
      populate: {
        path: "user_id",
        select: "username"
      }
    });

const getById = (id) =>
  Tasks.findOne({ _id: id })
    .populate("worker_id", "username profile_photo role")
    .populate("user_id", "username profile_photo role");
const createReport = (data) => new Report(data).save(); 
const create = (data) => new Tasks(data).save();

const updateById = (id, data) =>
  Tasks.findByIdAndUpdate(id, data, { new: true });

const deleteById = (id) => Tasks.findByIdAndDelete(id);
const deleteReportById = (id) => Report.findByIdAndDelete(id);

const getTasksByUser = (userId) =>
  Tasks.find({ user_id: userId })
    .sort({ createdAt: -1 })
    .populate("user_id", "username profile_photo");

const getTasksByProgress = (userId) =>
  Tasks.find({ user_id: userId ,progress: "Submitted"})
    .sort({ createdAt: -1 })
    .populate("worker_id", "username");

const getTasksCompleted = (userId) =>
  Tasks.find({ user_id: userId ,progress: "Completed"})
    .sort({ createdAt: -1 })
    .populate("worker_id", "username");

const getInprogressTasksByWorker = (workerId) =>
  Tasks.find({ worker_id: workerId })
    .select("title location description duration amount progress status photo deadline")
    .populate("user_id", "username profile_photo");

const getProgressNonTaken = () =>
  Tasks.find({
    status: { $in: ["active"] },
    progress: { $in: ["Not Taken"] },
    helper_id: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .populate("user_id", "username profile_photo");

const updateTaskRating = async (taskId, rating) => {
  return await Tasks.findByIdAndUpdate(taskId, { rating }, { new: true });
};


const calculateWorkerAverageRating = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const result = await Tasks.aggregate([
    { 
      $match: { 
        worker_id: userObjectId, 
        rating: { $gt: 0 } 
      } 
    },
    {
      $group: {
        _id: "$worker_id",
        avgRating: { $avg: "$rating" },
        total: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) return result[0];
  return null;
};

const updateWorkerRating = async (userId, avgRating, total) => {
  const worker = await Worker.findOneAndUpdate(
    { user_id: new mongoose.Types.ObjectId(userId) },
    {
      rating: avgRating.toFixed(1),
      total_reviews: total
    },
    { new: true }
  );

  return worker;
};

async function getTasksCompletedLast7Days() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  return await Tasks.aggregate([
    { $match: { progress: "Completed", updatedAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
}

const getActiveTasks = async (workerId) => {
  return Tasks.find({
    worker_id: workerId,
    progress: { $nin: ["Completed"] },
  });
};

const getCompletedTasks = async (workerId) => {
  return Tasks.find({
    worker_id: workerId,
    progress: "Completed",
  });
};

module.exports = {
  countAll,
  countCompleted,
  getAll,
  create,
  updateById,
  deleteById,
  getProgressNonTaken,
  getById,
  getInprogressTasksByWorker,
  getTasksByUser,
  getTasksByProgress,
  getTasksCompleted,
  updateTaskRating,

  calculateWorkerAverageRating,
  updateWorkerRating,

  createReport,
  getAllReports,
  deleteReportById,
  
  getTasksCompletedLast7Days,
  getActiveTasks,
  getCompletedTasks,
};
