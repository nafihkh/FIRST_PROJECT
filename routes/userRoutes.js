const express = require("express");
const { checkLogin, checkAlreadyLoggedIn } = require("../middleware/checklogin");
const auth = require("../middleware/auth")

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
router.get("/overview", checkLogin, auth(["user"]), (req, res) => {
  res.render("user/overview", { title: "Overview", activePage: "overview" });
});


module.exports = router;
