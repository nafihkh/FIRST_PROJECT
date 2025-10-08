const bcrypt = require("bcryptjs");

const userRepo = require("../repositories/userRepository");
const taskRepo = require("../repositories/taskRepository");
const paymentRepo = require("../repositories/paymentRepository");

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

module.exports = {
  getMetrics,
  getSettings,
};
