const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
  skills: [{ type: String }] 
});

module.exports = mongoose.model('HomeData', homeSchema);