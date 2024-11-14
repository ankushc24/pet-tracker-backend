const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require('../sendMail');
const User = require('../models/UserDetails');

const JWT_SECRET = "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

// Register route with OTP verification
router.post("/register", async (req, res) => {
  const { name, email, mobile, password, userType } = req.body;

  if (!name || !email || !mobile || !password || !userType) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  const oldUser = await User.findOne({ email: email });
  
  if (oldUser) {
    return res.status(409).json({ status: "error", message: "User already exists" });
  }

  try {
    const encryptedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);

    await User.create({
      name,
      email,
      mobile,
      password: encryptedPassword,
      userType,
      otp,
      isVerified: false
    });

    await sendMail(email, 'Email Verification', { name, otp });
    res.status(201).json({ status: "ok", message: "User created successfully. Verification email sent." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Verify user by OTP
router.post("/verifyuser", async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ status: "error", message: "OTP is required" });
  }

  try {
    const user = await User.findOne({ otp });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ status: "error", message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({ status: "ok", message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Forgot password route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: "error", message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    await User.deleteOne({ email });
    res.status(200).json({ status: "ok", message: "User account has been reset. Please register again." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Login route
router.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  const oldUser = await User.findOne({ email: email });

  if (!oldUser) {
    return res.status(404).json({ status: "error", message: "User doesn't exist!" });
  }

  if (await bcrypt.compare(password, oldUser.password)) {
    const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);
    return res.status(200).json({
      status: "ok",
      data: token,
      userType: oldUser.userType,
    });
  } else {
    return res.status(400).json({ status: "error", message: "Invalid password" });
  }
});

// Google login
router.post("/google-login", async (req, res) => {
  const { email, name, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        userType: "User",
      });
      await user.save();
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET);

    res.status(200).json({
      status: "ok",
      token,
      userType: user.userType,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Get user data by token
router.post("/userdata", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET);
    const useremail = user.email;

    User.findOne({ email: useremail }).then((data) => {
      return res.send({ status: "Ok", data: data });
    });
  } catch (error) {
    return res.send({ error: error });
  }
});

// Update user information
router.post("/update-user", async (req, res) => {
  const { name, email, mobile, image, gender, profession } = req.body;
  try {
    await User.updateOne(
      { email: email },
      {
        $set: {
          name,
          mobile,
          image,
          gender,
          profession,
        },
      }
    );
    res.send({ status: "Ok", data: "Updated" });
  } catch (error) {
    return res.send({ error: error });
  }
});

// Get all users
router.get("/get-all-user", async (req, res) => {
  try {
    const data = await User.find({});
    res.send({ status: "Ok", data: data });
  } catch (error) {
    return res.send({ error: error });
  }
});

// Delete user by ID
router.post("/delete-user", async (req, res) => {
  const { id } = req.body;
  try {
    await User.deleteOne({ _id: id });
    res.send({ status: "Ok", data: "User Deleted" });
  } catch (error) {
    return res.send({ error: error });
  }
});

module.exports = router;
