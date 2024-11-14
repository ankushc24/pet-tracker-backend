const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    mobile: String,
    password: String,
    image: String,
    gender: String,
    profession: String,
    userType: String,
    otp: String, // Field to store OTP for verification step after registration
    isVerified: { type: Boolean, default: false } // Field to store verification status, default is false
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", UserDetailSchema);
