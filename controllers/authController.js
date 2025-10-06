const authService = require("../services/authService");

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const { token, role, rememberMe: rm } = await authService.login(email, password, "admin", rememberMe);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rm ? 7 * 24 * 60 * 60 * 1000 : null,
    });

    res.json({ message: "Login successful", token, role });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, role } = await authService.login(email, password, "user");

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600000 });
    res.json({ message: "Login successful", token, role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.loginWorker = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, role } = await authService.login(email, password, "worker");

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600000 });
    res.json({ message: "Login successful", token, role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    await authService.register({ ...req.body, role: "admin" });
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.registerWorker = async (req, res) => {
  try {
    await authService.register({ ...req.body, role: "worker" });
    res.status(201).json({ message: "Worker registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.registerUser = async (req, res) => {
  try {
    await authService.register({ ...req.body, role: "user" });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ message: "OTP sent to your email.", email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    await authService.verifyOtp(email, otp);
    res.json({ message: "OTP verified. You can now reset your password." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, conpassword } = req.body;
    await authService.resetPassword(email, password, conpassword);
    res.json({ message: "Password reset successful. Please login." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};