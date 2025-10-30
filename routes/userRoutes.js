const express = require("express");
const { checkLogin, checkAlreadyLoggedIn } = require("../middleware/checklogin");
const auth = require("../middleware/auth")
const taskController = require("../controllers/tasksController");
const userController = require("../controllers/userController");
const messageController = require("../controllers/messageController");
const paymentController = require("../controllers/paymentController");

const otpController = require("../controllers/otpController");
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

router.get("/overview", checkLogin, auth(["user"]), userController.getDashboard);

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

// router.get("/chat", (req, res) => {
//   res.render("user//messages");
// });

router.get("/payments/invoice",checkLogin, auth(["user"]), paymentController.renderInvoicesuser);
router.get("/invoice/delete/:id", auth(["user"]), paymentController.deleteInvoice);
//router.get("/create/:userId/:type/:title", messageController.createConversation);
router.post("/send-message",checkLogin, auth(["user"]), messageController.sendMessage);

router.get("/messages",
  checkLogin,
  auth(["user"]),
  messageController.getUserConversations
);

router.get("/messages/:conversationId",
  checkLogin,
  auth(["user"]),
  messageController.getMessagesByConversationUser
);



router.get("/postapproval", checkLogin, auth(["user"]), userController.getWorkerRequests);
router.post("/approve/:taskId/:userId", checkLogin, auth(["user"]), userController.approveWorker);
router.post("/reject/:taskId/:userId", checkLogin, auth(["user"]), userController.rejectWorker);

router.get("/payments", checkLogin, auth(["user"]), paymentController.getPayments);
router.get("/settings", checkLogin, auth(["user"]), (req, res) => {
  res.render("user/settings", { title: "Settings", activePage: "settings" });
});
router.get("/approvals", checkLogin, auth(["user"]), taskController.getSubmittedTasks);
router.get("/workerapproval", checkLogin, auth(["user"]), (req, res) => {
  res.render("user/workerapproval", { title: "worker approval" });
});
router.post("/workerrequest", checkLogin, auth(["user"]), userController.requestWorker);

router.put("/rating/:id", checkLogin, auth(["user"]), taskController.rateTask);
router.patch("/tasks/:task/approve", auth(["user"]), taskController.taskapprove);
router.patch("/tasks/:task/reject", auth(["user"]), taskController.taskreject);

router.get("/create-order/:id/pay", checkLogin, auth(["user"]), paymentController.createOrder); // ✅ URL param
router.post("/verify-payment", checkLogin, auth(["user"]), paymentController.verifyPayment);

router.get("/pay/:id", checkLogin, auth(["user"]), paymentController.renderPayPage);
// verify payment (from checkout handler)
// router.post('/verify-payment', paymentController.verifyPayment);

router.post("/email/send", checkLogin, auth(["user"]), otpController.sendEmailOtp);

router.post("/email/verify", checkLogin, auth(["user"]), otpController.verifyEmailOtp);

router.post("/phone/send", checkLogin, auth(["user"]), otpController.sendPhoneOtp);

router.post("/phone/verify", checkLogin, auth(["user"]), otpController.verifyPhoneOtp);

  router.get("/invoice/:id",  checkLogin, auth(["user"]), paymentController.showInvoice);

router.get("/settings", checkLogin, auth(["user"]), userController.settingsPage);
router.post("/settings/profile", checkLogin, auth(["user"]), upload.single("profile_photo"), userController.updateProfile);
router.post("/settings/password", checkLogin, auth(["user"]), userController.updatePassword);

module.exports = router;
