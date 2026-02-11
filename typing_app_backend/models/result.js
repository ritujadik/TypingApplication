const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
 // ✅ ensures one test per user
  },
  wordsTyped: Number,
  accuracy: Number,
  timeTaken: Number,
  language : String,
  font: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Result", resultSchema);
