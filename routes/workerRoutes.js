const express = require("express");
const { checkLogin, checkAlreadyLoggedIn } = require("../middleware/checklogin");
const auth = require("../middleware/auth")
const taskController = require("../controllers/tasksController");
const cartController = require("../controllers/cartController");
const userController = require("../controllers/userController");
const workerController = require("../controllers/workerController");
const otpController = require("../controllers/otpController");
const messageController = require("../controllers/messageController");
const upload = require("../config/cloudinary");

const router = express.Router();

router.get("/login", checkAlreadyLoggedIn, (req, res) => {
  res.render("worker/login", { title: "Login" });
});

router.get("/signup", (req, res) => {
  res.render("worker/signup", { title: "Sign Up" });
});
router.get("/forgotpassword", (req, res) => {
  res.render("worker/forgotpassword", { title: "Reset Password" });
});

router.get("/verify-otp", (req, res) => {
  const { email } = req.query; // from redirect
  res.render("worker/verify-otp", { title: "Verify OTP", email });
});

router.get("/reset-password", (req, res) => {
  const { email } = req.query;
  res.render("worker/reset-password", { title: "Set New Password", email });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/worker/login");
});

router.get("/dashboard", checkLogin, auth(["worker"]), (req, res) => {
  res.render("worker/dashboard", { title: "Dashboard", activePage: "dashboard" });
});
router.get("/tasks", checkLogin, auth(["worker"]), (req, res) => {
  res.render("worker/tasks", { title: "Tasks", activePage: "tasks" });
});
router.get("/activejobs", checkLogin, auth(["worker"]), (req, res) => {
  res.render("worker/activejobs", { title: "Active Jobs", activePage: "activejobs" });
});
router.get("/activejobs/viewmore", checkLogin, auth(["worker"]), (req, res) => {
  res.render("worker/task-details", { title: "Active Jobs", activePage: "activejobs" });
});
router.get("/settings", checkLogin, auth(["worker"]), workerController.getSettings);

router.get("/earnings", checkLogin, auth(["worker"]), (req, res) => {
  res.render("worker/earnings", { title: "Earnings", activePage: "earnings" });
});
router.get("/messages", checkLogin, auth(["worker"]), workerController.getmessages);
router.get("/tasks/progress-nontaken", taskController.getProgressNonTakenTasks);

router.post("/cart/add", checkLogin, auth(["worker"]), cartController.addToCart);

// Get cart
router.get("/cart", checkLogin, auth(["worker"]), cartController.getCart);

// Remove from cart
router.post("/cart/remove", checkLogin, auth(["worker"]), cartController.removeFromCart);
router.post("/cart/proceed", checkLogin, auth(["worker"]), cartController.proceedTask);

router.get("/api/activejobs", checkLogin, auth(["worker"]), taskController.getActiveTasks);
router.get("/activejobs/viewmore/:taskId", checkLogin, auth(["worker"]), taskController.viewMoreTask);

router.post("/settings/profile", checkLogin, auth(["worker"]), upload.single("profile_photo"), userController.updateProfile);
router.post("/settings/password", checkLogin, auth(["worker"]), userController.updatePassword);

router.get("/settings/skills", checkLogin, auth(["worker"]), workerController.getSkills);
router.post("/settings/skills", checkLogin, auth(["worker"]), workerController.addSkill);
router.delete("/settings/skills/:skill", checkLogin, auth(["worker"]), workerController.removeSkill);

router.post("/email/send", checkLogin, auth(["worker"]), otpController.sendEmailOtp);

router.post("/email/verify", checkLogin, auth(["worker"]), otpController.verifyEmailOtp);

router.post("/phone/send", checkLogin, auth(["worker"]), otpController.sendPhoneOtp);

router.post("/phone/verify", checkLogin, auth(["worker"]), otpController.verifyPhoneOtp);

router.post("/messages", messageController.sendMessage);
router.get("/messages/:conversation_id", messageController.getMessages);
router.put("/messages/:message_id/read", messageController.markAsRead);
router.get("/messages/:conversation_id/unread/:user_id", messageController.getUnread);
 
module.exports = router;
