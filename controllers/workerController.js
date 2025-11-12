const workerService = require("../services/workerService");
const userService = require("../services/userService");


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
    if (!worker) return res.status(404).render("404");

    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const toggleBlock = async (req, res) => {
  try {
    const worker = await workerService.toggleBlock(req.params.id);
    if (!worker) return res.status(404).render("404");

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
    const worker = await workerService.approveWorker(req.params.id);
    
    
    await workerService.approvestaff(worker._id);

    res.redirect("/admin/workers/approvals");
  } catch (err) {
    console.error(err);
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

const getSkills = async (req, res) => {
  try {
    const skills = await workerService.getSkills(req.user._id);
    if (!skills)
      return res.status(404).render("404");

    res.json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const addSkill = async (req, res) => {
  try {
    const userId = req.user._id; // set from auth middleware
    const { skill } = req.body;

    const result = await workerService.addSkill(userId, skill);
    if (!result) return res.status(404).render("404");
    if (result === "exists") return res.status(400).json({ success: false, error: "Skill already exists" });

    return res.json({ success: true, skills: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Remove Skill
const removeSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const skill = req.params.skill; // get skill from URL param

    if (!skill) {
      return res.status(400).json({ success: false, error: "Skill is required" });
    }

    const result = await workerService.removeSkill(userId, skill);

    if (!result) return res.status(404).render("404");

    res.json({ success: true, skills: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};



const getSettings = async (req, res) => {
  try {
    const { worker, user } = await workerService.getWorkerSettings(req.user._id);
    const stats = await workerService.getPerformanceStats(req.user._id);

    res.render("worker/settings", {
      title: "Settings",
      activePage: "settings",
      user,
      worker,
      stats,
    });
  } catch (err) {
    console.error(err);
    if (err.message === "Worker not found") {
      return res.status(404).render("404");
    }
    res.status(500).send("Internal Server Error");
  }
};
const getDashboard = async (req, res) => {
  try {
    const data = await workerService.getDashboardData(req.user._id);
    res.json(data);
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
  getSkills,
  addSkill,
  removeSkill,
  getSettings,
  getDashboard,
};
