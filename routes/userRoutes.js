const express = require("express");
const { checkLogin, checkAlreadyLoggedIn } = require("../middleware/checklogin");
const auth = require("../middleware/auth")
const taskController = require("../controllers/tasksController");
const userController = require("../controllers/userController");
const upload = require("../config/cloudinary");

const router = express.Router();

router.get("/login", checkAlreadyLoggedIn, (req, res) => {
  res.render("user/login", { title: "Login" });
});

router.get("/signup", (req, res) => {
  res.render("user/signup", { title: "Sign Up" });
});
router.get("/forgotpassword", (req, res) => {
  res.render("user/forgotpassword", { title: "Reset Password" });
});

router.get("/verify-otp", (req, res) => {
  const { email } = req.query; // from redirect
  res.render("user/verify-otp", { title: "Verify OTP", email });
});

router.get("/reset-password", (req, res) => {
  const { email } = req.query;
  res.render("user/reset-password", { title: "Set New Password", email });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/user/login");
});

// DASHBOARD
router.get("/dashboard", checkLogin, auth(["user"]), (req, res) => {
  res.render("user/dashboard", { title: "Dashboard", activePage: "dashboard" });
});
router.get("/tasks/progress-nontaken", taskController.getProgressNonTakenTasks);

router.get("/overview", checkLogin, auth(["user"]), (req, res) => {
  res.render("user/overview", { title: "Overview", activePage: "overview" });
});

router.get("/createpost", checkLogin, auth(["user"]), taskController.getUserTasks);

router.put("/updatetask/:id", checkLogin, auth(["user"]), taskController.updateTask);

// Delete Task
router.delete("/deletetask/:id", checkLogin, auth(["user"]), taskController.deleteTask);

router.post(
  "/createtask",
  upload.single("task_photo"),
  checkLogin,
  auth(["user"]),   // ✅ ADD THIS
  taskController.createTask
);



router.get("/messages", checkLogin, auth(["user"]), (req, res) => {
  res.render("user/messages", { title: "Message", activePage: "messages" });
});
router.get("/payments", checkLogin, auth(["user"]), (req, res) => {
  res.render("user/payments", { title: "Payments", activePage: "payments" });
});
router.get("/settings", checkLogin, auth(["user"]), (req, res) => {
  res.render("user/settings", { title: "Settings", activePage: "settings" });
});
router.get("/workerapproval", checkLogin, auth(["user"]), (req, res) => {
  res.render("user/workerapproval", { title: "worker approval" });
});
router.post("/workerrequest", userController.requestWorker);

router.get("/settings", checkLogin, auth(["user"]), userController.settingsPage);
router.post("/settings/profile", checkLogin, auth(["user"]), upload.single("profile_photo"), userController.updateProfile);
router.post("/settings/password", checkLogin, auth(["user"]), userController.updatePassword);

module.exports = router;
