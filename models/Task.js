const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema({
    code: { type: String, required: true }, // New field to store team code
    tasks: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        dueDate: { type: Date, required: true },
        assignedTo: { type: String, required: true },
        priority: {
          type: String,
          enum: ["high", "medium", "low"],
          default: "medium",
        },
        //can remove status
        status: {
          type: String,
          enum: ["to-do", "in progress", "completed"],
          default: "to-do",
        },
      },
    ],
  });
  
  // Create Task model
  const Task = mongoose.model("Task", taskSchema);
module.exports = mongoose.model("Task", taskSchema);
