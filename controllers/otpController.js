const otpService = require("../services/otpService");



exports.sendEmailOtp = async (req, res) => {
  try {
    const result = await otpService.sendEmailOtp(req.user._id);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Send Email OTP Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send email OTP. Please try again later.",
    });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    const result = await otpService.verifyEmailOtp(req.user._id, otp);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Verify Email OTP Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error verifying email OTP. Please try again.",
    });
  }
};



exports.sendPhoneOtp = async (req, res) => {
  try {
    const result = await otpService.sendPhoneOtp(req.user._id);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    const result = await otpService.verifyPhoneOtp(req.user._id, otp);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    console.error("Verify Phone OTP Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error verifying phone OTP. Please try again.",
    });
  }
};
