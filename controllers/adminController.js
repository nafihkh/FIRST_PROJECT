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