const mongoose = require('mongoose');

const contactDataSchema = new mongoose.Schema({
  email: { type: String },
  location: { type: String },
  status: { type: String }
});

module.exports = mongoose.model('ContactData', contactDataSchema);