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
const Task = require("./models/task.js");


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

//route to join team
app.post("/join", async (req, res) => {
  const teamCode = req.body.teamCode;
  const memberEmail = req.body.memberEmail;
  try {
    // Find the team with the provided team code
    let team = await Team.findOne({ code: teamCode });

    // If team doesn't exist, create a new instance
    if (!team) {
      team = new Team({
        code: teamCode,
        members: [memberEmail], // Store the member's email in the members field
      });
    } else {
      // Check if the team is not full (i.e., less than 4 members)
      if (team.members.length >= 4) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Team is already full. Cannot add more members.",
          });
      }
      // Add the user's email to the team's members
      team.members.push(memberEmail);
    }

    // Save the team (either the existing one with updated members or the newly created one)
    await team.save();
    currTeamCode = teamCode;

    res
      .status(200)
      .json({
        success: true,
        message: "You have successfully joined the team.",
      });
  } catch (err) {
    console.error("Error joining team:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while joining the team.",
      });
  }
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

//routes for tasks
// API endpoint to create a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo, priority } = req.body;
    const existingTask = await Task.findOne({ currTeamCode });

    if (existingTask) {
      // If a task exists for the team code, add the new task to it
      existingTask.tasks.push({
        title,
        description,
        dueDate,
        assignedTo,
        priority,
        
      });
      await existingTask.save();
      res.status(201).json(existingTask);
    } else {
      // If no task exists for the team code, create a new task and store it with the team code
      const newTask = await Task.create({
        code: currTeamCode,
        tasks: [{ title, description, dueDate, assignedTo, priority }],
      });
      newTask.save();
      res.status(201).json(newTask);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create task." });
  }
});

//GET ALREADY EXISTING TASKS
app.get("/getTasks", async (req, res) => {
  try {
    // Find the tasks associated with the team code
    const tasks = await Task.find({ code: currTeamCode });

    if (tasks) {
      // console.log("tasks get send");
      res.status(200).json(tasks);
    } else {
      res.status(404).json({ message: "No tasks found for the team code." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});
// Route to handle DELETE requests for deleting a specific task based on its ID
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id });
    if (deletedTask) {
      res.json(deletedTask);
    } else {
      res.status(404).json({ error: "Task not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete task." });
  }
});



app.listen(80, function () {
  console.log("Your app is listening on port " + 80);
});
