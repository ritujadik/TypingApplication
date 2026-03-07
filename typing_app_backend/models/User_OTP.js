const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",          // references the User model
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    default: "reset_password"
  },
  attempts: {
    type: Number,
    default: 0
  }
}, { timestamps: true }); // optional: tracks createdAt/updatedAt
module.exports = mongoose.model("OTP", OTPSchema);