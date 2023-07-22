const express = require("express");
const session = require("express-session");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const crypto = require("crypto");
require("dotenv").config();
//including models
const User = require("./models/user.js");

// Generate a random session secret
const sessionSecret = crypto.randomBytes(32).toString("hex");
//middlewares

// The session middleware
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));

//connecting mongodb
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

//routes
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/login.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/views/register.html");
});

app.get("/main", (req, res) => {
  res.sendFile(__dirname + "/views/main.html");
});

//registering new user
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Create a new user
  try {
    // Create a new user
    const user = new User({ email, password });
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.json({ success: false });
  }
});

app.listen(80, function () {
  console.log("Your app is listening on port " + 80);
});
