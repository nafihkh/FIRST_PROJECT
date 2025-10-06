const workerRepository = require("../repositories/workerRepository");


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

module.exports = {
  getWorkers,
  deleteWorker,
  updateWorker,
  toggleBlock,
  viewWorker,
  getPendingWorkers,
  approveWorker,
  rejectWorker,
};
