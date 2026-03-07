const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/User_OTP');
const e = require('express');

const router = express.Router();

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP (placeholder)
const sendOTP = async (emailOrMobile, otp) => {
    console.log(`Sending OTP ${otp} to ${emailOrMobile}`);
    try{
        // Convert to string to ensure includes() works
        const identifier = String(emailOrMobile);
        
        const query = identifier.includes('@') 
            ? { email: identifier } 
            : { mobile: identifier };
        
        const user = await User.findOne(query);

        if(!user){
            console.log(`User not found for sending OTP to ${identifier}`);
            return false; // Changed: False -> false
        }
        
        // Delete any existing OTPs for this user (optional but recommended)
        await OTP.deleteMany({ 
            userId: user._id, 
            type: "reset_password" 
        });
        
        const otpRecord = await OTP.create({ 
            userId: user._id,
            otp: otp.toString(), 
            type: "reset_password",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
        });
        
        console.log("OTP saved to database:", {
            id: otpRecord._id,
            userId: user._id,
            otp: otp,
            expiresAt: otpRecord.expiresAt
        });
        
        return true; // Changed: True -> true
        
    } catch(error){
        console.error("Error sending OTP:", error);
        return false; // Changed: False -> false
    }
}

// Signup route
router.post('/signup', async (req, res) => {
    const { username, mobile, email, password } = req.body;

    // Validation
    if (!username || !mobile || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const existingMobile = await User.findOne({ mobile });
        if (existingMobile) {
            return res.status(400).json({ error: "Mobile number already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, mobile, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, mobile, password } = req.body;
    if (!password || (!email && !mobile)) {
        return res.status(400).send("Email or mobile and password are required");
    }
    try {
        const user = await User.findOne({ $or: [{ email }, { mobile }] });
        if (!user) {
            return res.status(401).send("User not found");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid credentials");
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            message: "Login successful",
            token,
            user: { username: user.username, email: user.email, mobile: user.mobile }
        });
        console.log("User logged in successfully:", user.email || user.mobile);
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal server error");
    }
});

// Logout route
router.post("/logout", (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
});

// Forgot password: send OTP
router.post("/forgot-password", async (req, res) => {
  const { email, mobile } = req.body;
  if (!email && !mobile) {
    return res.status(400).json({ error: "Email or mobile is required" });
  }
  try {
    const user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await OTP.create({ userId: user._id, otp: otpCode, expiresAt, type: "reset_password" });
    await sendOTP(email || mobile, otpCode);

    // ✅ Always respond with JSON
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify OTP
// Backend verify-otp endpoint
router.post("/verify-otp", async (req, res) => {
  const { email, mobile, otp, type } = req.body;
  
    console.log("=== OTP Verification Request ===");
    console.log("Request body:", { email, mobile, otp, type });
    console.log("Request headers:", req.headers);
  if (!otp || (!email && !mobile)) {
     console.log("Missing required fields");
    return res.status(400).json({ error: "OTP and email/mobile are required" });
  }

  try {
    console.log("Looking for user with:", { email, mobile });
    // Find user by email or mobile
    const query = [];
    if (email) query.push({ email });
    if (mobile) query.push({ mobile });
    const user = await User.findOne({ $or: query });
    console.log("User found:", user ? user._id : "No user found");
    // const user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find valid OTP
     console.log("Looking for OTP record with:", {
      userId: user._id,
      otp: otp,
      type: type || "reset_password",
      currentTime: new Date()
    });
    const otpRecord = await OTP.findOne({
      userId: user._id,
      otp: otp,
      type: type || "reset_password",
      expiresAt: { $gt: new Date() }
    });
        console.log("OTP record found:", otpRecord ? "Yes" : "No");
    if (otpRecord) {
      console.log("OTP details:", {
        id: otpRecord._id,
        createdAt: otpRecord.createdAt,
        expiresAt: otpRecord.expiresAt
      });
    }

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Optional: Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("=== ERROR in OTP verification ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error",details: error.message });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
    // Accept either email OR mobile, not emailOrMobile
    const { email, mobile, newPassword, confirmPassword } = req.body;
    
    console.log("Reset password request:", { email, mobile, newPassword, confirmPassword });

    // Check if either email or mobile is provided
    if (!email && !mobile) {
        return res.status(400).json({ error: "Email or mobile is required" });
    }

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New password and confirm password do not match" });
    }

    try {
        // Find user by either email or mobile
        const user = await User.findOne({ 
            $or: [
                { email: email }, 
                { mobile: mobile }
            ] 
        });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if OTP was verified (you might want to have a flag for this)
        // For now, we'll assume OTP was verified in the previous step
        
        // Check if new password is same as current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ error: "New password cannot be same as your current password" });
        }

        // Check password history (optional - if you maintain password history)
        if (user.passwordHistory && user.passwordHistory.length > 0) {
            for (let oldPasswordHash of user.passwordHistory) {
                const isMatch = await bcrypt.compare(newPassword, oldPasswordHash);
                if (isMatch) {
                    return res.status(400).json({ 
                        error: "This password has been used recently. Please choose a different password." 
                    });
                }
            }
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password history (optional)
        if (!user.passwordHistory) {
            user.passwordHistory = [];
        }
        // Add current password to history before updating
        user.passwordHistory.push(user.password);
        // Keep only last 5 passwords
        if (user.passwordHistory.length > 5) {
            user.passwordHistory = user.passwordHistory.slice(-5);
        }
        
        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Delete any remaining OTPs for this user
        await OTP.deleteMany({ userId: user._id });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error during reset password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;