//create schema to store teams with their code
const mongoose = require("mongoose");
const teamSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  members: {
    type: [String],
    validate: {
      validator: function (members) {
        return members.length <= 4;
      },
      message: "Team is full!! Try another valid code.",
    },
  },
});

const Team = mongoose.model("Team", teamSchema);
module.exports = mongoose.model("Team", teamSchema);
