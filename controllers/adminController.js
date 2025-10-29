const adminService = require("../services/adminService");
exports.getMetrics = async (req, res) => {
  try {
    const metrics = await adminService.getMetrics();
    res.json(metrics);
  } catch (err) {
    console.error("Metrics API Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.settingsPage = async (req, res) => {
  try {
    const user = await adminService.getSettings(req.user._id);
    res.render("admin/settings", {
      title: "Settings",
      user,
      activePage: "settings",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getUserGrowth = async (req, res) => {
  try {
    const data = await adminService.getUserGrowthLast7Days();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
exports.getWorkerRating = async (req, res) => {
  try {
    const data = await adminService.getWorkerRatingLast7Days();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
exports.getTasksCompleted = async (req, res) => {
  try {
    const data = await adminService.getTasksCompletedLast7Days();
    res.json(data);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
}