const taskRepo = require("../repositories/taskRepository");

async function getTasks() {
  return taskRepo.getAll();
}

async function createTask({ title, photo, location, description, duration, amount }) {
  return taskRepo.create({ title, photo, location, description, duration, amount });
}

async function getTaskById(taskId) {
  return await taskRepo.getById(taskId);
}

async function updateTask(id, { title, photo, location, description, duration, amount }) {
  const task = await taskRepo.updateById(id, { title, photo, location, description, duration, amount });
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

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateStatus,
  getProgressNonTakenTasks,
  fetchInprogressTasks,
  getTaskById,
};