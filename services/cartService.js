const cartRepository = require("../repositories/cartRepository");

async function addToCart(workerId, taskId) {
  const worker = await cartRepository.getWorkerById(workerId);
  if (!worker) throw new Error("Worker not found");

  if (worker.cart.some(id => id._id.toString() === taskId.toString())) {
    throw new Error("Task already in cart");
  }

  worker.cart.push(taskId);
  await cartRepository.saveWorker(worker);

  // return updated cart with tasks populated
  return await cartRepository.getWorkerById(workerId);
}

async function getCart(workerId) {
  return await cartRepository.getWorkerById(workerId);
}

async function removeFromCart(workerId, taskId) {
  const worker = await cartRepository.getWorkerById(workerId);
  if (!worker) throw new Error("Worker not found");

  worker.cart = worker.cart.filter(id => id._id.toString() !== taskId.toString());
  await cartRepository.saveWorker(worker);

  return await cartRepository.getWorkerById(workerId);
}

async function proceedTask(workerId, taskId) {
  const task = await cartRepository.getTaskById(taskId);
  if (!task) throw new Error("Task not found");

  task.progress = "InProgress";
  task.worker_id = workerId;
  await task.save();

  const worker = await cartRepository.getWorkerById(workerId);
  worker.cart = worker.cart.filter(id => id._id.toString() !== taskId.toString());
  await cartRepository.saveWorker(worker);

  return {
    task,
    worker: await cartRepository.getWorkerById(workerId),
  };
}

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  proceedTask,
};
