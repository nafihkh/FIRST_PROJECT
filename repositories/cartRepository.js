const Worker = require("../models/Worker");
const Task = require("../models/Tasks");

async function getWorkerById(workerId) {
  return Worker.findById(workerId)
        .populate({
      path: "cart",           
      populate: {
        path: "user_id",     
        select: "username profile_photo" 
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