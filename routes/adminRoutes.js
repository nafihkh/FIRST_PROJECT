const express = require("express");
const { checkLogin, checkAlreadyLoggedIn } = require("../middleware/checklogin");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");
const taskController = require('../controllers/tasksController');
const userController = require("../controllers/userController");
const workerController = require("../controllers/workerController");
const upload = require("../config/cloudinary");

const router = express.Router();


router.get("/login", checkAlreadyLoggedIn, (req, res) => {
  res.render("admin/login", { title: "Login" });
});

router.get("/signup", (req, res) => {
  res.render("admin/signup", { title: "Sign Up" });
});
router.get("/forgotpassword", (req, res) => {
  res.render("admin/forgotpassword", { title: "Reset Password" });
});

router.get("/verify-otp", (req, res) => {
  const { email } = req.query; // from redirect
  res.render("admin/verify-otp", { title: "Verify OTP", email });
});

router.get("/reset-password", (req, res) => {
  const { email } = req.query;
  res.render("admin/reset-password", { title: "Set New Password", email });
});
// DASHBOARD
router.get("/dashboard", checkLogin, auth(["admin"]), (req, res) => {
  res.render("admin/dashboard", { title: "Dashboard", activePage: "overview" });
});
router.get("/metrics", auth(["admin"]), adminController.getMetrics);

// PROBLEMS
router.get("/problems", checkLogin, auth(["admin"]), (req, res) => {
  res.render("admin/problems", { title: "Problems", activePage: "problems" });
});

router.get("/tasks", auth(["admin"]), taskController.getTask);
router.post("/tasks", auth(["admin"]), taskController.createTask);
router.put("/tasks/:id", auth(["admin"]), taskController.updateTask);
router.delete("/tasks/:id", auth(["admin"]), taskController.deleteTask);
router.patch("/tasks/:id/status", auth(["admin"]), taskController.updateStatus);

//USERS
router.get("/users", checkLogin, auth(["admin"]), (req, res) => {
  res.render("admin/users", { title: "User Managment", activePage: "users" });
});

router.get("/users/list", checkLogin, auth(["admin"]), userController.getUsers);

router.delete("/users/:id", checkLogin, auth(["admin"]), userController.deleteUser);
router.put("/users/:id", checkLogin, auth(["admin"]), userController.updateUser);
router.patch("/users/:id/block", checkLogin, auth(["admin"]), userController.toggleBlock);

//WORKER
router.get("/workers", checkLogin, auth(["admin"]), (req, res) => {
  res.render("admin/workers", { title: "Worker Managment", activePage: "workers" });
});
router.get("/workers/approvals", checkLogin, auth(["admin"]), workerController.showWorkerApprovals);
router.post("/approve-worker/:id", checkLogin, auth(["admin"]), workerController.approveWorker);
router.post("/reject-worker/:id", checkLogin, auth(["admin"]), workerController.rejectWorker);

router.get("/workers/viewmore/:id", checkLogin, auth(["admin"]), workerController.viewWorker);

router.get("/worker/list", checkLogin, auth(["admin"]), workerController.getWorkers);  
router.delete("/worker/:id", checkLogin, auth(["admin"]), workerController.deleteWorker); 
router.put("/worker/:id", checkLogin, auth(["admin"]), workerController.updateWorker);  
router.patch("/worker/:id/block", checkLogin, auth(["admin"]), workerController.toggleBlock);


router.get("/payments", checkLogin, auth(["admin"]), (req, res) => {
  res.render("admin/payments", { title: "Payments", activePage: "payments" });
});
router.get("/payments/invoice", checkLogin, auth(["admin"]), (req, res) => {
  res.render("admin/payments-invoice", { title: "Payments", activePage: "payments" });
});

//reports
router.get("/reports", checkLogin, auth(["admin"]), (req, res) => {
  res.render("admin/reports", { title: "Reports", activePage: "reports" });
});


router.get("/settings", checkLogin, auth(["admin"]), adminController.settingsPage);
router.post("/settings/profile", checkLogin, auth(["admin"]), upload.single("profile_photo"), adminController.updateProfile);
router.post("/settings/password", checkLogin, auth(["admin"]), adminController.updatePassword);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/login");
});

module.exports = router;