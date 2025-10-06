const express = require("express");
const { checkLogin, checkAlreadyLoggedIn } = require("../middleware/checklogin");
const auth = require("../middleware/auth")
const taskController = require("../controllers/tasksController");
const cartController = require("../controllers/cartController");

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
router.get("/settings", checkLogin, auth(["worker"]), (req, res) => {
  res.render("worker/settings", { title: "Settings", activePage: "settings" });
});
router.get("/earnings", checkLogin, auth(["worker"]), (req, res) => {
  res.render("worker/earnings", { title: "Earnings", activePage: "earnings" });
});
router.get("/messages", checkLogin, auth(["worker"]), (req, res) => {
  res.render("worker/messages", { title: "Messages", activePage: "messages" });
});
router.get("/tasks/progress-nontaken", taskController.getProgressNonTakenTasks);

router.post("/cart/add", checkLogin, auth(["worker"]), cartController.addToCart);

// Get cart
router.get("/cart", checkLogin, auth(["worker"]), cartController.getCart);

// Remove from cart
router.post("/cart/remove", checkLogin, auth(["worker"]), cartController.removeFromCart);
router.post("/cart/proceed", checkLogin, auth(["worker"]), cartController.proceedTask);

router.get("/api/activejobs", checkLogin, auth(["worker"]), taskController.getActiveTasks);
router.get("/activejobs/viewmore/:taskId", checkLogin, auth(["worker"]), taskController.viewMoreTask);
 
module.exports = router;
