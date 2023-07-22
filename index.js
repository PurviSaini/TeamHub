const express = require("express");
const session = require("express-session");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const crypto = require("crypto");
require("dotenv").config();
let currTeamCode = "";
//including models
const User = require("./models/user.js");
const Team = require("./models/team.js");


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
// Middleware to check if the user is authenticated
function checkAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.json({ loggedIn: false });
  }
}
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

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email and password
  try {
    // Find user by email and password
    const user = await User.findOne({ email, password });
    if (user) {
      req.session.user = user; // Store user data in the session
      res.json({ success: true, userEmail: user.email });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error("Error:", error);
    res.json({ success: false });
  }
});

//checkmembership
app.post("/checkTeamMembership", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user's email is part of any team
    const team = await Team.findOne({ members: email });
    const isMember = team ? true : false;
    if (team) {
      currTeamCode = team.code; // Get the value of 'code' from the 'team' object
    }
    res.json({ isMember });
  } catch (error) {
    console.error("Error checking team membership:", error);
    res.json({ isMember: false });
  }
});

app.get("/checkAuth", checkAuth, (req, res) => {
  res.json({ loggedIn: true });
});

app.get("/logout", checkAuth, async (req, res) => {
  try {
    await req.session.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.json({ success: false });
  }
});

app.get("/team", function (req, res) {
  res.sendFile(__dirname + "/views/team.html");
});

app.listen(80, function () {
  console.log("Your app is listening on port " + 80);
});
