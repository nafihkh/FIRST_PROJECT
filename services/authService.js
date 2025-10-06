const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const userRepo = require("../repositories/userRepository");

async function login(email, password, role, rememberMe = false) {
  const user = await userRepo.findByEmailAndRole(email, role);
  if (!user) throw new Error("Invalid User");

  const isMatch = await bcrypt.compare(password + process.env.CUSTOM_SALT, user.password);
  if (!isMatch) throw new Error("Invalid Password");

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? "7d" : "1h" }
  );

  return { user, token, role: user.role, rememberMe };
}

async function register({ username, email, phone, password, role }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(password + process.env.CUSTOM_SALT, 10);

  const user = await userRepo.createUser({
    username,
    email,
    phone,
    password: hashedPassword,
    role,
  });

  return user;
}

async function forgotPassword(email) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error("Please enter a registered email");

  const otp = crypto.randomInt(100000, 999999).toString();

  user.resetOtp = otp;
  user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"NEIGHBOURHOOD" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email with NEIGHBOURHOOD",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #f9fafc;">
        
        <h2 style="text-align: center; color: #2d89ef; margin-bottom: 10px;">
          Welcome to NEIGHBOURHOOD 
        </h2>
        
        <p style="font-size: 15px; color: #444;">
          Hi ${user.username}, <br><br>
        </p>
         <p style="font-size: 14px; color: #666;">
          Please use the verification code below to confirm your email address. 
          This code will expire in <strong>10 minutes</strong>.
        </p>

        
        <div style="text-align: center; margin: 25px 0;">
          <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2d89ef; background: #fff; padding: 15px 25px; border-radius: 8px; border: 1px solid #ddd;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          If you didn’t request this code, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2025 NEIGHBOURHOOD — All rights reserved
        </p>
      </div>
    `,
  });

  return { email };
}

async function verifyOtp(email, otp) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error("Invalid email");

  if (user.resetOtp !== otp.trim() || user.resetOtpExpires < Date.now()) {
    throw new Error("Invalid or expired OTP");
  }

  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;
  await user.save();

  return true;
}

async function resetPassword(email, password, conpassword) {
  if (password !== conpassword) throw new Error("Passwords do not match");

  const user = await userRepo.findByEmail(email);
  if (!user) throw new Error("Invalid request");

  user.password = await bcrypt.hash(password + process.env.CUSTOM_SALT, 10);
  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;

  await user.save();

  return true;
}

module.exports = {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
