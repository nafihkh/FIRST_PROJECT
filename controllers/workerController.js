const workerService = require("../services/workerService");


const getWorkers = async (req, res) => {
  try {
    const workers = await workerService.getWorkers();
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const deleteWorker = async (req, res) => {
  try {
    const worker = await workerService.deleteWorker(req.params.id);
    if (!worker) return res.status(400).json({ error: "Worker not found" });

    res.json({ message: "Worker deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateWorker = async (req, res) => {
  try {
    const worker = await workerService.updateWorker(req.params.id, req.body);
    if (!worker) return res.status(404).json({ error: "Worker not found" });

    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const toggleBlock = async (req, res) => {
  try {
    const worker = await workerService.toggleBlock(req.params.id);
    if (!worker) return res.status(404).json({ error: "Worker not found" });

    res.json({
      message: `Worker ${worker.accessibility ? "unblocked" : "blocked"}`,
      accessibility: worker.accessibility,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const viewWorker = async (req, res) => {
  try {
    const data = await workerService.viewWorker(req.params.id);
    if (!data) return res.redirect("/admin/workers");

    res.render("admin/viewmore", {
      title: "Worker Details",
      worker: data.worker,
      activePage: "workers",
      stats: data.stats,
      tasks: data.tasks,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};


const showWorkerApprovals = async (req, res) => {
  try {
    const pendingWorkers = await workerService.getPendingWorkers();
    res.render("admin/workerapproval", {
      title: "Worker Approvals",
      activePage: "workers",
      workers: pendingWorkers,
    });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};


const approveWorker = async (req, res) => {
  try {
    await workerService.approveWorker(req.params.id);
    res.redirect("/admin/workers/approvals");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};


const rejectWorker = async (req, res) => {
  try {
    await workerService.rejectWorker(req.params.id);
    res.redirect("/admin/workers/approvals");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getWorkers,
  deleteWorker,
  updateWorker,
  toggleBlock,
  viewWorker,
  showWorkerApprovals,
  approveWorker,
  rejectWorker,
};
