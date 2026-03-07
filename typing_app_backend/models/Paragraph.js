
const mongoose = require('mongoose')
const paragraphSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['english', 'hindi']
  },

  // pattern: {
  //   type: String,
  //   enum: ['SSC', 'UPSC', 'RPSC', 'UPSTATE', 'Others'],
  //   default: 'SSC'
  // },

  time: {
    type: String,
    required: false,
    enum: ['5 Min', '10 Min', '15 Min', 'Free']
  },

  passage: {
    type: Number,
    required: false,
    enum: [500, 1000,1500,1800]
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
