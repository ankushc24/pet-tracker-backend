
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Import and configure dotenv

app.use(express.json());

// Enable CORS for all IPs and origins
app.use(cors({
  origin: "*", // Allow requests from any origin/IP
}));

// Use MongoDB URI from the environment file
const mongoUrl = process.env.mongo_uri;

mongoose.connect(mongoUrl)
  .then(() => console.log("Database Connected"))
  .catch((e) => console.log(e));

// Import routes
const userRoutes = require('./routes/user');
const petRoutes = require('./routes/pet');

app.get("/", (req, res) => {
  res.send({ status: "Started", message: "Welcome to the server" });
});

// Use routes
app.use("/user", userRoutes);
app.use("/pet", petRoutes);

const PORT = 5001;
app.listen(PORT,() => {
  console.log(`Node.js server started on port ${PORT}`);
});
