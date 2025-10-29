const userService = require("../services/userService");


exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(400).json({ error: "User not found" });

    res.json({ message: "User deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleBlock = async (req, res) => {
  try {
    const user = await userService.toggleBlock(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      message: `User ${user.accessibility ? "unblocked" : "blocked"}`,
      accessibility: user.accessibility,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    await userService.updateProfile(req.user._id, req.body, req.file);
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    await userService.updatePassword(
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

exports.settingsPage = async (req, res) => {
  try {
    const user = await userService.getSettings(req.user._id);
    res.render("user/settings", {
      title: "Settings",
      user,
      activePage: "settings",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.requestWorker = async (req, res) => {
  try {
    const { identifier } = req.body;
    const result = await userService.requestWorker(identifier);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const Tasks = require("../models/Tasks");

exports.getWorkerRequests = async (req, res) => {
  try {
    const tasks = await Tasks.find()
      .populate("response", "username profile_photo");

    res.render("user/postapproval", { 
      tasks ,
      title: "Post Approval",
      activePage: "createpost",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.approveWorker = async (req, res) => {
  try {
    const { taskId, userId } = req.params;

    await Tasks.findByIdAndUpdate(taskId, {
      worker_id: userId,
      progress: "InProgress" ,
      response: []  
    });

    res.redirect("/user/postapproval");
  } catch (err) {
    console.log("Approval Error:", err);
    res.status(500).send("Server Error");
  }
};

exports.rejectWorker = async (req, res) => {
  try {
    const { taskId, userId } = req.params;

    await Tasks.findByIdAndUpdate(taskId, {
      $pull: { response: userId }  
    });

    res.redirect("/user/postapproval");
  } catch (err) {
    console.log("Reject Error:", err);
    res.status(500).send("Server Error");
  }
};

const Task = require("../models/Tasks"); 
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1️⃣ Total Posts Created
        const totalPosts = await Task.countDocuments({ user_id: userId });

        // 2️⃣ Completed Tasks
        const completedTasks = await Task.countDocuments({ user_id: userId, progress: "Completed" });

        // 3️⃣ Ongoing Tasks
        const ongoingTasks = await Task.countDocuments({ user_id: userId, progress: "InProgress" });


     
        const spendSave = await Task.aggregate([
            { $match: { user_id: userId, status: "completed" } },
            {
                $group: {
                    _id: null,
                    totalSave: { $sum: "$amount" },
                }
            }
        ]);

        res.render("user/overview", {
            totalPosts,
            completedTasks,
            ongoingTasks,
            spendSave: spendSave[0] || { totalSpend: 0, totalSave: 0 },
            title: "Overview", 
            activePage: "overview"
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

