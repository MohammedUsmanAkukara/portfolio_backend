const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Uploads folder automatically banaye agar nahi hai
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// @route   POST /api/upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // File ka accessible URL generate karna
    const imageUrl = `https://portfolio-backend-31zk.vercel.app/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, url: imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;