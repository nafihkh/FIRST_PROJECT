const taskRepo = require("../repositories/taskRepository");
const cloudinary = require("cloudinary").v2;

async function getTasks() {
  return taskRepo.getAll();
}

async function createTask(data, file) {
  let taskData = { ...data };

  // CHECK: Image file ullo?
  if (file && file.path) {
    const result = await cloudinary.uploader.upload(file.path, { folder: "photo" });
    taskData.photo = result.secure_url;
  }

  return taskRepo.create(taskData);
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

async function updateStatus(id, status) {
  const task = await taskRepo.updateById(id, { status });
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
};