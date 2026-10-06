const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconName: { type: String, required: true }, // Hum icon ka naam string bhejenge (jaise "Globe")
  color: { type: String, required: true },
  bgColor: { type: String, required: true },
  tags: [{ type: String }] // Array of strings
});

module.exports = mongoose.model('Service', serviceSchema);