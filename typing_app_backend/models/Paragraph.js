
const mongoose = require('mongoose')
const paragraphSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['english', 'hindi', 'thai']
  },

  pattern: {
    type: String,
    enum: ['SSC', 'UPSC', 'RPSC', 'UPSTATE', 'Others'],
    default: 'SSC'
  },

  time: {
    type: String,
    required: true,
    enum: ['1 Min', '2 Min', '5 Min', '10 Min', '15 Min', 'free']
  },

  passage: {
    type: Number,
    required: true,
    enum: [200, 300, 500, 1000]
  },

  mock: {
    type: Number,
    required: true
  },

  text: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Paragraph', paragraphSchema);
