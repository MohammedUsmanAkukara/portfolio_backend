const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  company: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'lead'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
