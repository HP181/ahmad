const mongoose = require("mongoose");


const Mail = new mongoose.Schema({
  to: [{
    type: String,
  }],
  cc: [{
    type: String,
  }],
  name: {
    type: String,
  },
  subject: {
    type: String,
  },
  message: {
    type: String,
  },
  salutation: {
    type: String,
  },
  content: {
    type: String,
  },
  html: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {collection: "Mail"});

module.exports = mongoose.model("Mail", Mail);
