const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  attachmentUrl: { type: String, default: "" } // Agar file bheji ho
}, { timestamps: true });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);