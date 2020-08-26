const mongoose = require("mongoose");

const trackerSchema = new mongoose.Schema({
  date: { type: String, required: true },
  usage: [
    {
      hostName: { type: String, required: true },
      duration: { type: Number, default: 0 },
    },
  ],
});

module.exports = trackerSchema;
