const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Uploads folder automatically banaye agar nahi hai
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// @route   POST /api/upload
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Kyunki memory storage hai, file req.file.buffer me hai.
    // Ise Cloudinary par upload karne ka tareeqa:
    cloudinary.uploader.upload_stream({ folder: "uploads" }, (error, result) => {
      if (error) return res.status(500).json({ error: error.message });

      // Result me se secure_url mil jayega jo aap database me save karoge
      res.status(200).json({
        message: "Image uploaded successfully!",
        imageUrl: result.secure_url // Yeh link aapke frontend/database me jayega
      });
    }).end(req.file.buffer);

  } catch (err) {
    res.status(500).json({ error: "ff" });
  }
});

module.exports = router;