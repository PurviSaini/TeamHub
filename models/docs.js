const mongoose = require("mongoose");
//store the docs
const sharedFilesSchema= new mongoose.Schema({
    code: { type: String, required: true }, 
    docs:[
      {
        title:{ type: String},
        description:{ type: String, required: true }
      }
    ]
  });
  
  // Create sharedFiles model
  const sharedFiles = mongoose.model("sharedFiles", sharedFilesSchema);
module.exports = mongoose.model("sharedFiles", sharedFilesSchema);
