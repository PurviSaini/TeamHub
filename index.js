const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {userAuth} = require('./middlewares/auth');
require("dotenv").config();
let currTeamCode = "";
//including models
const User = require("./models/User.js");
const Team = require("./models/team.js");
const Task = require("./models/task.js");
const sharedFiles = require("./models/docs.js");

//middlewares
app.use(cookieParser());
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

app.get("/main",userAuth, (req, res) => {
  res.sendFile(__dirname + "/views/main.html");
});

//registering new user
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

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

  try {
    // Find user by email and password
    const user = await User.findOne({ email, password });
    if (user) {
      //1. Create JWT Token
    const token = await jwt.sign({_id: user._id}, process.env.JWT_SECRET);

    //2. Add the token to cookie and send the reponse back to the user
    res.cookie('token', token);
    
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

app.get("/logout", async (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

app.get("/team", userAuth, function (req, res) {
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


//API endpoint to create a new doc
app.post("/newDoc", async (req, res) => {
  try {
    const { title, description } = req.body;
    // console.log(title,description)
    const existingDoc = await sharedFiles.findOne({ currTeamCode });

    if (existingDoc) {
      // If a Doc exists for the team code, add the new task to it
      existingDoc.docs.push({
        title,
        description
        
      });
      await existingDoc.save();
      res.status(201).json(existingDoc);
    } else {
      // If no task exists for the team code, create a new task and store it with the team code
      const newDoc = await sharedFiles.create({
        code: currTeamCode,
        docs: [{ title, description }],
      });
      newDoc.save();
      res.status(201).json(newDoc);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Doc." });
  }
});


//GET ALREADY EXISTING docs
app.get("/getDocs", async (req, res) => {
  try {
    // Find the docs associated with the team code
    const docs = await sharedFiles.find({ code: currTeamCode });
    // console.log(docs)
    if (docs) {
      res.status(200).json(docs);
    } else {
      res.status(404).json({ message: "No docs found for the team code." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch docs." });
  }
});


// Route to handle DELETE requests for deleting a specific doc based on its ID
app.delete("/docs/:id", async (req, res) => {
  try {
    const deletedDoc = await sharedFiles.findOneAndDelete({ _id: req.params.id });
    if (deletedDoc) {
      res.json(deletedDoc);
    } else {
      res.status(404).json({ error: "doc not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete doc." });
  }
});

app.listen(80, function () {
  console.log("Your app is listening on port " + 80);
});
