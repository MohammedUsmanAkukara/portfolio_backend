const express = require('express');
const multer = require('multer');
const router = express.Router();

// Memory storage use karein taaki Vercel par error na aaye
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Buffer ko Base64 Data URL mein convert karna
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let mimeType = req.file.mimetype; 
    let dataUrl = `data:${mimeType};base64,${b64}`;

    // Yeh dataUrl hi aapka final image string hai jo database mein jayega
    return res.status(200).json({
      message: "Image uploaded successfully!",
      imageUrl: dataUrl // Yeh key 'imageUrl' match honi chahiye frontend ke response se
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;