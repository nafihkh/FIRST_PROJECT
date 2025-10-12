const cartService = require("../services/cartService");

exports.addToCart = async (req, res) => {
  try {
    const workerId = req.user._id; // logged-in worker
    const { taskId } = req.body;

    const updatedWorker = await cartService.addToCart(workerId, taskId);
    res.status(201).json({ success: true, cart: updatedWorker.cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const workerId = req.user._id;
    const worker = await cartService.getCart(workerId);
    res.json({ cart: worker ? worker.cart : [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { taskId } = req.body;

    const updatedWorker = await cartService.removeFromCart(workerId, taskId);
    res.json({ success: true, cart: updatedWorker.cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.proceedTask = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { taskId } = req.body;

    const result = await cartService.proceedTask(workerId, taskId);
    res.json({
      success: true,
      message: "Wait for task approval",
      task: result.task,
      cart: result.worker.cart,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
