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
const paymentController = require("../controllers/paymentController");

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

router.get("/earnings", checkLogin, auth(["worker"]), paymentController.getPaymentsworker);
router.get("/earnings/createinvoice", checkLogin, auth(["worker"]), paymentController.renderCreateInvoice);

router.get("/invoice/create",checkLogin, auth(["worker"]), paymentController.renderCreateInvoice);
router.get("/dashboarddata",checkLogin, auth(["worker"]), workerController.getDashboard);

// Handle form submit
router.post("/invoice/create",checkLogin, auth(["worker"]), paymentController.createInvoice);
router.get("/earnings/invoice",checkLogin, auth(["worker"]), paymentController.renderInvoices);
router.get("/invoice/delete/:id", auth(["worker"]), paymentController.deleteInvoice);
router.patch("/tasks/:task/progress", auth(["worker"]), taskController.taskprogress);

router.get("/tasks/progress-nontaken", taskController.getProgressNonTakenTasks);

router.post("/cart/add", checkLogin, auth(["worker"]), cartController.addToCart);

router.get('/create/:userId/:type/:title/:taskId',checkLogin, auth(["worker"]), messageController.createConversation);
router.post("/send-message",checkLogin, auth(["worker"]), messageController.sendMessage);
router.post("/task/:id/report", checkLogin, auth(["worker", "user"]), taskController.createReport);

router.get("/messages",
  checkLogin,
  auth(["worker"]),
  messageController.getUserConversationsworker
);

router.get("/messages/:conversationId",
  checkLogin,
  auth(["worker"]),
  messageController.getMessagesByConversationworker
);
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

 
module.exports = router;
