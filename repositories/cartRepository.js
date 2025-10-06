const Worker = require("../models/Worker");
const Task = require("../models/Tasks");

async function getWorkerById(workerId) {
  return Worker.findById(workerId)
        .populate({
      path: "cart",           // first populate the cart array (tasks)
      populate: {
        path: "user_id",      // then inside each task, populate user_id
        select: "username profile_photo" // only get these fields
      }
    });
}

async function saveWorker(worker) {
  return worker.save();
}

async function getTaskById(taskId) {
  return Task.findById(taskId);
}

module.exports = {
  getWorkerById,
  saveWorker,
  getTaskById,
};