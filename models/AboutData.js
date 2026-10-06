const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  bio: { type: String },
  location: { type: String },
  education: { type: String },
  experiences: [
    {
      title: { type: String },
      period: { type: String }
    }
  ]
});

module.exports = mongoose.model('AboutData', aboutSchema);