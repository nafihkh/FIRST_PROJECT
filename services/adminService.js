const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

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

async function updateProfile(userId, data, file) {
  let updateData = { ...data };

  if (file && file.path) {
    const result = await cloudinary.uploader.upload(file.path, { folder: "profiles" });
    updateData.profile_photo = result.secure_url;
  }

  return userRepo.updateById(userId, updateData);
}

async function updatePassword(userId, currentPassword, newPassword, confirmPassword) {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error("User not found");

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const isMatch = await bcrypt.compare(currentPassword + process.env.CUSTOM_SALT, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  user.password = await bcrypt.hash(newPassword + process.env.CUSTOM_SALT, 10);
  await user.save();

  return true;
}

module.exports = {
  getMetrics,
  getSettings,
  updateProfile,
  updatePassword,
};
