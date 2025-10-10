const workerRepository = require("../repositories/workerRepository");
const userRepository = require("../repositories/userRepository");


const getWorkers = () => workerRepository.getAllWorkers();


const deleteWorker = (id) => workerRepository.deleteWorker(id);


const updateWorker = (id, updates) => workerRepository.updateWorker(id, updates);


const toggleBlock = (id) => workerRepository.toggleWorkerBlock(id);


const viewWorker = async (id) => {
  const worker = await workerRepository.findWorkerById(id);
  if (!worker) return null;

  const tasks = await workerRepository.getTasksByWorker(id);

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


const getPendingWorkers = () => workerRepository.findPendingWorkers();


const approveWorker = (id) => workerRepository.approveWorker(id);


const rejectWorker = (id) => workerRepository.rejectWorker(id);

const createWorkerProfile = async (userId, jobtitle, skills) => {
  return await workerRepository.createWorkerProfile({ user_id: userId, username: "", jobtitle, skills });
};

const updateWorkerProfile = async (userId, updates) => {
  return await workerRepository.updateWorkerProfile(userId, updates);
};

const getWorkerProfile = async (userId) => {
  return await workerRepository.getWorkerProfile(userId);
};

const getSkills = async (userId) => {
  const worker = await workerRepository.findByUserId(userId);
  if (!worker) return null;
  return worker.skills;
};

const addSkill = async (userId, skill) => {
  const worker = await workerRepository.findByUserId(userId);
  if (!worker) return null;

  if (worker.skills.includes(skill)) return "exists";

  worker.skills.push(skill);
  await worker.save();
  return worker.skills;
};

const removeSkill = async (userId, skill) => {
  const worker = await workerRepository.findByUserId(userId);
  if (!worker) return null;

  worker.skills = worker.skills.filter((s) => s !== skill);
  await worker.save();
  return worker.skills;
};

const getWorkerSettings = async (userId) => {
  const worker = await workerRepository.findByUserId(userId);
  if (!worker) {
    throw new Error("Worker not found");
  }

  const user = await userRepository.findById(userId);
  return { worker, user };
};

const approvestaff = async (userId) => {
  const user = await userRepository.findById(userId);
  await workerRepository.createWorkerProfileIfNotExists(userId, user.username);
  return user;
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

  ...workerRepository,
  createWorkerProfile,
  updateWorkerProfile,
  getWorkerProfile,
  getSkills,
  addSkill,
  removeSkill,
  getWorkerSettings,
  approvestaff,
};
