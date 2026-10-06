const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { 
    type: String, 
    default: 'admin' // Default username 
  },
  passcode: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);