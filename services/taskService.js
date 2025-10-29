const taskRepo = require("../repositories/taskRepository");
const cloudinary = require("cloudinary").v2;
const mongoose = require('mongoose');

async function getTasks() {
  return taskRepo.getAll();
}
async function getReports() {
  return taskRepo.getAllReports();
}

async function createTask(data, file) {
  let taskData = { ...data };

  
  if (file && file.path) {
    const result = await cloudinary.uploader.upload(file.path, { folder: "photo" });
    taskData.photo = result.secure_url;
  }

  return taskRepo.create(taskData);
}
async function createReport(data) {
  return await taskRepo.createReport(data);
}

async function getTaskById(taskId) {
  return await taskRepo.getById(taskId);
}

async function updateTask(id, { title, photo, location, description, duration, amount ,deadline}) {
  const task = await taskRepo.updateById(id, { title, photo, location, description, duration, amount ,deadline});
  if (!task) throw new Error("Task not found");
  return task;
}

async function deleteTask(id) {
  const task = await taskRepo.deleteById(id);
  if (!task) throw new Error("Task not found");
  return { message: "Task deleted successfully" };
}
async function deleteReport(id) {
  const report = await taskRepo.deleteReportById(id);
  if (!report) throw new Error("Report not found");
  return { message: "Report deleted successfully" };
}

async function updateStatus(id, status) {
  const task = await taskRepo.updateById(id, { status });
  if (!task) throw new Error("Task not found");
  return task;
}
async function updateProgress(id, progress) {
  const task = await taskRepo.updateById(id, { progress });
  if (!task) throw new Error("Task not found");
  return task;
}


async function getProgressNonTakenTasks() {
  return taskRepo.getProgressNonTaken();
}

async function fetchInprogressTasks(workerId) {
    return await taskRepo.getInprogressTasksByWorker(workerId);
}

async function getTasksByUser(userId) {
  return await taskRepo.getTasksByUser(userId);
}
async function getTasksByProgress(userId) {
  return await taskRepo.getTasksByProgress(userId);
}
async function getTasksCompleted(userId) {
  return await taskRepo.getTasksCompleted(userId);
}


async function rateTask(taskId, rating) {
  const task = await taskRepo.updateTaskRating(taskId, rating);
  if (!task) throw new Error("Task not found");

  // Since worker_id points to User, not Worker
  const stats = await taskRepo.calculateWorkerAverageRating(task.worker_id);

  console.log("🎯 Rating for Task:", rating);
console.log("🧩 Task.worker_id (User._id):", task.worker_id);
console.log("📈 Aggregation Stats:", stats);

  if (stats) {
    const updatedWorker = await taskRepo.updateWorkerRating(
      task.worker_id,
      stats.avgRating,
      stats.total
    );
    if (updatedWorker) {
      console.log("Worker rating updated successfully:", updatedWorker.rating);
    } else {
      console.log("No matching worker found to update rating.");
    }
  } else {
    console.log("No rated tasks found for this worker.");
  }

  return task;
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateStatus,
  getProgressNonTakenTasks,
  fetchInprogressTasks,
  getTaskById,
  getTasksByUser,
   updateProgress,
   getTasksByProgress,
   getTasksCompleted,
   rateTask,
   createReport,
   getReports,
   deleteReport,
};