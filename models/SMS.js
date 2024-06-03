const mongoose = require("mongoose");


const SMS = new mongoose.Schema({
  to: [{
    type: String,
  }],
  message: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {collection: "SMS"});

module.exports = mongoose.model("SMS", SMS);
