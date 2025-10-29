const nodemailer = require("nodemailer");
const userRepo = require("../repositories/userRepository");
const twilio = require("twilio");
const crypto = require("crypto");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmailOtp = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error("User not found");

  // Generate secure 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = Date.now() + 2 * 60 * 1000; // 2 minutes

  await userRepo.updateById(userId, {
  resetOtp: otp,
  resetOtpExpires: expires,
  });

  const mailOptions = {
    from: `"NEIGHBOURHOOD" <${process.env.EMAIL_USER}>`,
    to: user.email,
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
  };

  await transporter.sendMail(mailOptions);
  console.log("📧 Email OTP sent:", otp);

  return { success: true, message: "OTP sent to your email" };
};


exports.verifyEmailOtp = async (userId, otpInput) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error("User not found");

  
  console.log("Entered OTP (from user):", otpInput);
  console.log("Stored OTP (in DB):", user.resetOtp);
  console.log(" Expires at:", new Date(user.resetOtpExpires));

  if (!user.resetOtp || !user.resetOtpExpires) {
    return { success: false, message: "No OTP found" };
  }

  if (Date.now() > user.resetOtpExpires) {
    return { success: false, message: "OTP expired" };
  }

  if (String(user.resetOtp) !== String(otpInput)) {
    return { success: false, message: "Invalid OTP" };
  }

  await userRepo.updateById(userId, {
    mail_verified: true,
   resetOtp: null,
    resetOtpExpires: null,
  });

  return { success: true, message: "Email verified successfully" };
};


exports.sendPhoneOtp = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error("User not found");


  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = Date.now() + 2 * 60 * 1000;

  await userRepo.updateById(userId, {
  resetOtp: otp,
  resetOtpExpires: expires,
  });

  console.log("Phone OTP sent:", otp);
  const toNumber = user.phone.startsWith('+') ? user.phone : '+91' + user.phone;
  let support = 8921232409;
  await client.messages.create({
    body: `Your NEIGHBOURHOOD  verification code is ${otp}. It expires in 2 minutes. If you did not request this, contact ${support}.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: toNumber,
  });

  return { success: true, message: "OTP sent to your phone" };
};


exports.verifyPhoneOtp = async (userId, otpInput) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error("User not found");

  console.log("Entered OTP:", otpInput);
  console.log("Stored OTP:", user.resetOtp);

  if (!user.resetOtp || !user.resetOtpExpires) {
    return { success: false, message: "No OTP found" };
  }

  if (Date.now() > user.resetOtpExpires) {
    return { success: false, message: "OTP expired" };
  }

  if (String(user.resetOtp) !== String(otpInput)) {
    return { success: false, message: "Invalid OTP" };
  }

  await userRepo.updateById(userId, {
    phone_verified: true,
   resetOtp: null,
     resetOtpExpires: null,
  });

  return { success: true, message: "Phone verified successfully" };
};