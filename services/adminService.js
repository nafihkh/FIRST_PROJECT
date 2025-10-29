const bcrypt = require("bcryptjs");

const userRepo = require("../repositories/userRepository");
const taskRepo = require("../repositories/taskRepository");
const paymentRepo = require("../repositories/paymentRepository");
const workerRepo = require("../repositories/workerRepository");



async function getMetrics() {
  const totalUsers = await userRepo.countByRole("user");
  const totalWorkers = await userRepo.countByRole("worker");
  const totalAdmins = await userRepo.countByRole("admin");

  const totalPayments = await paymentRepo.countAll();
  const totalTasks = await taskRepo.countAll();
  const completedTasks = await taskRepo.countCompleted();

  return {
    totalAdmins,
    totalUsers,
    totalWorkers,
    totalPayments,
    totalTasks,
    completedTasks,
  };
}

async function getSettings(userId) {
  return userRepo.findById(userId);
}

async function getUserGrowthLast7Days() {
  return await userRepo.getUserGrowthLast7Days();
}

async function getWorkerRatingLast7Days() {
  return await workerRepo.getworkerRatingLast7Days();
}

async function getTasksCompletedLast7Days() {
  return await taskRepo.getTasksCompletedLast7Days();
}
module.exports = {
  getMetrics,
  getSettings,
 getWorkerRatingLast7Days,
 getUserGrowthLast7Days,
 getTasksCompletedLast7Days,
};
