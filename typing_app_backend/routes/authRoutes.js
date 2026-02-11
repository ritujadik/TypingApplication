const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/signup',async(req, res) => {
    const { username,mobile, email, password } = req.body;

    if ( !username && !mobile && !email && !password) {
        return res.status(400).send("All fields are required");
    }
    if (password.length < 6) {
        return res.status(400).send("Password must be at least 6 characters long");
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).send("Invalid email format");
    }
    if (!/^\d{10}$/.test(mobile)) {
        return res.status(400).send("Invalid mobile number format");
    }

    try{
        const existingUser = await User.findOne({ $or: [ { email }, { mobile } ] });
        if (existingUser) {
            return res.status(400).send("User with this email or mobile already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({username,mobile,email,password:hashedPassword});
        await newUser.save();
        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Internal server error");
    }
    // Here you would typically handle the signup logic, e.g., saving the user to a database
});
router.post('/login', async (req, res) => {
    const { email, mobile, password } = req.body;
    if (!password || (!email && !mobile)) {
        return res.status(400).send("Email or mobile and password are required");
    }
    try{
        const user  = await User.findOne({ $or: [ { email }, { mobile } ] });
        if(!user){
            return res.status(401).send("User not found");
        }    
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).send("Invalid credentials");
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({message:"Login successful", token,user:{
            username:user.username,email:user.email,mobile:user.mobile  
        }});

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal server error");
    }
});

module .exports = router;