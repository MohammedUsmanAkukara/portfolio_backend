const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const router = express.Router();

// 1. SETUP ROUTE (Sirf ek baar chalana hai, apna code DB me save karne ke liye)
router.post('/setup', async (req, res) => {
  try {
    const { passcode } = req.body;

    // Check karein ki kya pehle se koi admin DB me hai
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already setup in database!' });
    }

    // Passcode ko encrypt (hash) karein
    const salt = await bcrypt.genSalt(10);
    const hashedPasscode = await bcrypt.hash(passcode, salt);

    // Save to Database
    const admin = await Admin.create({
      username: 'admin',
      passcode: hashedPasscode
    });

    res.status(201).json({ success: true, message: 'Admin secret code saved securely in DB!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// 2. LOGIN ROUTE (Frontend se auth modal yahan hit karega)
router.post('/login', async (req, res) => {
  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({ success: false, message: 'Passcode is required' });
    }

    // DB se admin fetch karein
    const admin = await Admin.findOne({ username: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not configured yet' });
    }

    // Encrypted code ko user ke daale gaye code se match karein
    const isMatch = await bcrypt.compare(passcode, admin.passcode);

    if (isMatch) {
      // Generate JWT Token
      const token = jwt.sign(
        { id: admin._id, username: admin.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        token
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid secret code. Access Denied.' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// 3. VERIFY TOKEN ROUTE (Frontend check karne ke liye)
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;