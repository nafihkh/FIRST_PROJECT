const workerRepo = require("../repositories/workerRepository");
const userRepo = require("../repositories/userRepository");
const taskRepo = require("../repositories/taskRepository");
const paymentRepo = require("../repositories/paymentRepository");



const getWorkers = () => workerRepo.getAllWorkers();


const deleteWorker = (id) => workerRepo.deleteWorker(id);


const updateWorker = (id, updates) => workerRepo.updateWorker(id, updates);


const toggleBlock = (id) => workerRepo.toggleWorkerBlock(id);


const viewWorker = async (id) => {
  const worker = await workerRepo.findWorkerById(id);
  if (!worker) return null;

  const tasks = await workerRepo.getTasksByWorker(id);

  const stats = {
    totalWorksDone: tasks.filter((t) => t.progress === "Completed").length,
    worksInProgress: tasks.filter((t) => t.progress === "InProgress").length,
    notTaken: tasks.filter((t) => t.progress === "Not Taken").length,
    totalMoneyEarned: tasks
      .filter((t) => t.progress === "Completed")
      .reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  const formattedTasks = tasks.map((task) => ({
    ...task.toObject(),
    created_at_formatted: task.created_at.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  return { worker, stats, tasks: formattedTasks };
};


const getPendingWorkers = () => workerRepo.findPendingWorkers();


const approveWorker = (id) => workerRepo.approveWorker(id);


const rejectWorker = (id) => workerRepo.rejectWorker(id);

const createWorkerProfile = async (userId, jobtitle, skills) => {
  return await workerRepo.createWorkerProfile({ user_id: userId, username: "", jobtitle, skills });
};

const updateWorkerProfile = async (userId, updates) => {
  return await workerRepo.updateWorkerProfile(userId, updates);
};

const getWorkerProfile = async (userId) => {
  return await workerRepo.getWorkerProfile(userId);
};

const getSkills = async (userId) => {
  const worker = await workerRepo.findByUserId(userId);
  if (!worker) return null;
  return worker.skills;
};

const addSkill = async (userId, skill) => {
  const worker = await workerRepo.findByUserId(userId);
  if (!worker) return null;

  if (worker.skills.includes(skill)) return "exists";

  worker.skills.push(skill);
  await worker.save();
  return worker.skills;
};

const removeSkill = async (userId, skill) => {
  const worker = await workerRepo.findByUserId(userId);
  if (!worker) return null;

  worker.skills = worker.skills.filter((s) => s !== skill);
  await worker.save();
  return worker.skills;
};

const getWorkerSettings = async (userId) => {
  const worker = await workerRepo.findByUserId(userId);
  if (!worker) {
    throw new Error("Worker not found");
  }

  const user = await userRepo.findById(userId);
  return { worker, user };
};

const approvestaff = async (userId) => {
  const user = await userRepo.findById(userId);
  await workerRepo.createWorkerProfileIfNotExists(userId, user.username);
  return user;
};
const getDashboardData = async (userId) => {
  const [
    activeTasks,
    completedTasks,
    pendingPayments,
    totalEarnings,
    monthlyEarnings,
    avgRating,
    totalReviews,
  ] = await Promise.all([
    taskRepo.getActiveTasks(userId),
    taskRepo.getCompletedTasks(userId),
    paymentRepo.getPendingPayments(userId),
   paymentRepo.getTotalEarnings(userId),
   paymentRepo.getMonthlyEarnings(userId),
    workerRepo.getAverageRating(userId),
    workerRepo.getTotalReviews(userId),
  ]);

  return {
    activeTasks: activeTasks.length,
    completedTasks: completedTasks.length,
    pendingPayments: pendingPayments.length,
    pendingTotal: pendingPayments.reduce((sum, i) => sum + i.amount, 0),
    totalEarnings,
    monthlyEarnings,
    avgRating,
    totalReviews,
  };
};

const getPerformanceStats = async (userId) => {
  const stats = await workerRepo.getPerformanceStats(userId);
  
  if (!stats) {
    throw new Error("Worker not found");
  }

  return stats;
};


module.exports = {
  getWorkers,
  deleteWorker,
  updateWorker,
  toggleBlock,
  viewWorker,
  getPendingWorkers,
  approveWorker,
  rejectWorker,

  ...workerRepo,
  createWorkerProfile,
  updateWorkerProfile,
  getWorkerProfile,
  getSkills,
  addSkill,
  removeSkill,
  getWorkerSettings,
  approvestaff,
  getDashboardData,
  getPerformanceStats,
};
