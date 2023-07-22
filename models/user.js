//Create the User schema and model
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("Register_users", userSchema);
module.exports = mongoose.model("Register_users", userSchema);