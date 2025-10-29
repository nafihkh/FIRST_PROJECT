const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'worker'], default: 'user' },
  profile_photo: { type: String },
  location:{type: String},
  jobtittle:{ type: String},
  rating: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Inactive' },
  accessibility: {type: Boolean, default: true},
  mail_verified: { type: Boolean, default: false },
  phone_verified: { type: Boolean, default: false },
  worker_status: { type: Boolean },
  created_at: { type: Date, default: Date.now },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
