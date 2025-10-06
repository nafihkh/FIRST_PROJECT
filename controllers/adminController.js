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

exports.updateProfile = async (req, res) => {
  try {
    await adminService.updateProfile(req.user._id, req.body, req.file);
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    await adminService.updatePassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword,
      req.body.confirmPassword
    );
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(400).json({ error: err.message });
  }
};