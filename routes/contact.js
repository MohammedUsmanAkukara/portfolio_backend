const express = require('express');
const router = express.Router();
const ContactData = require('../models/ContactData');
const ContactMessage = require('../models/ContactMessage');
const protect = require('../middlewares/authMiddleware');
const nodemailer = require('nodemailer'); // NAYA IMPORT

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @route   GET /api/contact/info
router.get('/info', async (req, res) => {
  try {
    let data = await ContactData.findOne();
    if (!data) {
      data = await ContactData.create({
        email: "hello@mohammedusman.com",
        location: "Raipur, Chhattisgarh, India",
        status: "Available for hire"
      });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/contact/info (Admin only)
router.put('/info', protect, async (req, res) => {
  try {
    let data = await ContactData.findOne();
    if (data) {
      data.email = req.body.email;
      data.location = req.body.location;
      data.status = req.body.status;
      await data.save();
    } else {
      data = await ContactData.create(req.body);
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// @route   POST /api/contact/message (Public)
router.post('/message', async (req, res) => {
  try {
    const { name, email, message, attachmentUrl } = req.body;
    
    // 1. Database me save karna
    const newMessage = await ContactMessage.create(req.body);

    // 2. Admin ko Email Shoot karna
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Khud ko mail bhej rahe hain
      subject: `New Portfolio Message from ${name}`,
      html: `
        <h3>New Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/> ${message}</p>
        ${attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${attachmentUrl}">View File</a></p>` : ''}
      `
    };

    // Asynchronously email bhej dega (user ko wait nahi karwayega)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("Email sending failed:", error);
      else console.log("Email sent successfully!");
    });

    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// @route   GET /api/contact/messages (Admin only)
// NAYA ROUTE: Pura inbox dekhne ke liye
router.get('/messages', protect, async (req, res) => {
  try {
    // Sabse naye messages pehle dikhenge
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

module.exports = router;