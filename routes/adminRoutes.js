const express = require("express");
const router = express.Router();

const { checkLogin, checkAlreadyLoggedIn } = require("../middleware/checklogin");
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");
const taskController = require("../controllers/tasksController");
const userController = require("../controllers/userController");
const workerController = require("../controllers/workerController");
const paymentController = require("../controllers/paymentController");
const upload = require("../config/cloudinary");

// Auth Pages
router.get("/login", checkAlreadyLoggedIn, (req, res) => res.render("admin/login", { title: "Login" }));
router.get("/signup", (req, res) => res.render("admin/signup", { title: "Sign Up" }));
router.get("/forgotpassword", (req, res) => res.render("admin/forgotpassword", { title: "Reset Password" }));
router.get("/verify-otp", (req, res) => res.render("admin/verify-otp", { title: "Verify OTP", email: req.query.email }));
router.get("/reset-password", (req, res) => res.render("admin/reset-password", { title: "Set New Password", email: req.query.email }));

// Dashboard and Metrics
router.get("/dashboard", checkLogin, auth(["admin"]), (req, res) =>
  res.render("admin/dashboard", { title: "Dashboard", activePage: "overview" })
);
router.get("/metrics", auth(["admin"]), adminController.getMetrics);
router.get("/user-growth", checkLogin, auth(["admin"]), adminController.getUserGrowth);
router.get("/user-rating", checkLogin, auth(["admin"]), adminController.getWorkerRating);
router.get("/tasks-completed", checkLogin, auth(["admin"]), adminController.getTasksCompleted);

// Problems
router.get("/problems", checkLogin, auth(["admin"]), (req, res) =>
  res.render("admin/problems", { title: "Problems", activePage: "problems" })
);
router.get("/problems/reports", checkLogin, auth(["admin"]), taskController.getReports);
router.delete("/report/:id", auth(["admin"]), taskController.deleteReport);

// Tasks Management
router.get("/tasks", auth(["admin"]), taskController.getTask);
router.post("/tasks", auth(["admin"]), taskController.createTask);
router.put("/tasks/:id", auth(["admin"]), taskController.updateTask);
router.delete("/tasks/:id", auth(["admin"]), taskController.deleteTask);
router.patch("/tasks/:id/status", auth(["admin"]), taskController.updateStatus);

// User Management
router.get("/users", checkLogin, auth(["admin"]), (req, res) =>
  res.render("admin/users", { title: "User Management", activePage: "users" })
);
router.get("/users/list", checkLogin, auth(["admin"]), userController.getUsers);
router.delete("/users/:id", checkLogin, auth(["admin"]), userController.deleteUser);
router.put("/users/:id", checkLogin, auth(["admin"]), userController.updateUser);
router.patch("/users/:id/block", checkLogin, auth(["admin"]), userController.toggleBlock);

// Worker Management
router.get("/workers", checkLogin, auth(["admin"]), (req, res) =>
  res.render("admin/workers", { title: "Worker Management", activePage: "workers" })
);
router.get("/workers/approvals", checkLogin, auth(["admin"]), workerController.showWorkerApprovals);
router.post("/approve-worker/:id", checkLogin, auth(["admin"]), workerController.approveWorker);
router.post("/reject-worker/:id", checkLogin, auth(["admin"]), workerController.rejectWorker);
router.get("/workers/viewmore/:id", checkLogin, auth(["admin"]), workerController.viewWorker);
router.get("/worker/list", checkLogin, auth(["admin"]), workerController.getWorkers);
router.delete("/worker/:id", checkLogin, auth(["admin"]), workerController.deleteWorker);
router.put("/worker/:id", checkLogin, auth(["admin"]), workerController.updateWorker);
router.patch("/worker/:id/block", checkLogin, auth(["admin"]), workerController.toggleBlock);

// Payment & Invoice
router.get("/payments", checkLogin, auth(["admin"]), paymentController.getPaymentsDashboard);
router.get("/payments/invoice", checkLogin, auth(["admin"]), paymentController.renderallInvoices);
router.get("/invoice/delete/:id", auth(["admin"]), paymentController.deleteInvoice);

// Reports
router.get("/reports", checkLogin, auth(["admin"]), (req, res) =>
  res.render("admin/reports", { title: "Reports", activePage: "reports" })
);

// Settings
router.get("/settings", checkLogin, auth(["admin"]), adminController.settingsPage);
router.post("/settings/profile", checkLogin, auth(["admin"]), upload.single("profile_photo"), userController.updateProfile);
router.post("/settings/password", checkLogin, auth(["admin"]), userController.updatePassword);

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin/login");
});

module.exports = router;
