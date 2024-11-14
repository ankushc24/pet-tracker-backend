const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require('./sendMail.js'); // Make sure to use './' to reference the current directory
 // Import the sendMail function
const dotenv = require('dotenv');
var cors = require('cors');
app.use(cors());


dotenv.config();

const mongoUrl =
//"mongodb+srv://ac04:IMnTQITBvpDKpvSu@cluster0.i67ph.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
"mongodb://localhost:27017/UserInfo";

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";
mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((e) => {
    console.log(e);
  });
require("./UserDetails");
const User = mongoose.model("UserInfo");

app.get("/", (req, res) => {
  res.send({ status: "Started" });
});

app.get("/users", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({}, '-password'); // Exclude password field

    // Check if users were found
    if (users.length > 0) {
      res.status(200).json({ status: "ok", data: users });
    } else {
      res.status(404).json({ status: "error", message: "No users found" });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// app.post("/register", async (req, res) => {
//   const { name, email, mobile, password, userType } = req.body;
//   console.log(req.body);

//   const oldUser = await User.findOne({ email: email });

//   if (oldUser) {
//     return res.send({ data: "User already exists!!" });
//   }
//   const encryptedPassword = await bcrypt.hash(password, 10);

//   try {
//     await User.create({
//       name: name,
//       email: email,
//       mobile,
//       password: encryptedPassword,
//       userType,
//     });
//     res.send({ status: "ok", data: "User Created" });
//   } catch (error) {
//     res.send({ status: "error", data: error });
//   }
// });
/*
app.post("/register", async (req, res) => {
  const { name, email, mobile, password, userType } = req.body;
  console.log(req.body);

  // Check if all required fields are present
  if (!name || !email || !mobile || !password || !userType) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  const oldUser = await User.findOne({ email: email });

  if (oldUser) {
    return res.status(409).json({ status: "error", message: "User already exists" });
  }

  try {
    const encryptedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      mobile,
      password: encryptedPassword,
      userType,
    });

    res.status(201).json({ status: "ok", message: "User created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});
*/

app.post("/register", async (req, res) => {
  const { name, email, mobile, password, userType } = req.body;
  console.log(req.body);

  // Check if all required fields are present
  if (!name || !email || !mobile || !password || !userType) {
      return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  const oldUser = await User.findOne({ email: email });
  
  if (oldUser) {
      return res.status(409).json({ status: "error", message: "User already exists" });
  }

  try {
      const encryptedPassword = await bcrypt.hash(password, 10);
      
      // Generate OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

      // Create the user with OTP
      await User.create({
          name,
          email,
          mobile,
          password: encryptedPassword,
          userType,
          otp, // Store OTP in the database for verification
          isVerified: false // Initial state of email verification
      });

      // Send verification email
      await sendMail(email, 'Email Verification', { name, otp });

      res.status(201).json({ status: "ok", message: "User created successfully. Verification email sent." });
  } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ status: "error", message: "Internal server error" });
  }
});



app.post("/verifyuser", async (req, res) => {
  const { otp } = req.body;

  // Check if OTP is provided
  if (!otp) {
    return res.status(400).json({ status: "error", message: "OTP is required" });
  }

  try {
    // Find a user with the provided OTP
    const user = await User.findOne({ otp }); // Define the 'user' variable here

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Check if the provided OTP matches the one stored in the database
    if (user.otp !== otp) {
      return res.status(400).json({ status: "error", message: "Invalid OTP" });
    }

    // Update the user's verification status
    user.isVerified = true;
    user.otp = null; // Clear the OTP after successful verification
    await user.save();

    res.status(200).json({ status: "ok", message: "Email verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});


app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: "error", message: "Email is required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Remove the user from the database
    await User.deleteOne({ email });

    res.status(200).json({ status: "ok", message: "User account has been reset. Please register again." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const oldUser = await User.findOne({ email: email });

  if (!oldUser) {
    return res.send({ data: "User doesn't exists!!" });
  }

  if (await bcrypt.compare(password, oldUser.password)) {
    const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);
    console.log(token);
    if (res.status(201)) {
      return res.send({
        status: "ok",
        data: token,
        userType: oldUser.userType,
      });
    } else {
      return res.send({ error: "error" });
    }
  }
});

app.post("/google-login", async (req, res) => {
  const { email, name, googleId } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new one
      user = new User({
        name,
        email,
        googleId,
        userType: "User", // or however you determine user type
      });
      await user.save();
    }

    // Create and send JWT
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

app.post("/userdata", async (req, res) => {
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

app.post("/update-user", async (req, res) => {
  const { name, email, mobile, image, gender, profession } = req.body;
  console.log(req.body);
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

app.get("/get-all-user", async (req, res) => {
  try {
    const data = await User.find({});
    res.send({ status: "Ok", data: data });
  } catch (error) {
    return res.send({ error: error });
  }
});

app.post("/delete-user",async (req, res) => {
 const {id}=req.body;
 try {
  await User.deleteOne({_id:id});
  res.send({status:"Ok",data:"User Deleted"});
 } catch (error) {
  return res.send({ error: error });
  
 }
})



app.listen(5001, () => {
  console.log("Node js server started.");
});
