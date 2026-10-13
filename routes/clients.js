const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const protect = require('../middlewares/authMiddleware');

// @route   GET /api/clients — Admin only: list all clients
router.get('/', protect, async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/clients — Admin only: create client
router.post('/', protect, async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create client' });
  }
});

// @route   PUT /api/clients/:id — Admin only: update client
router.put('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update client' });
  }
});

// @route   DELETE /api/clients/:id — Admin only: delete client
router.delete('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.status(200).json({ success: true, message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete client' });
  }
});

module.exports = router;
