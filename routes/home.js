const express = require('express');
const router = express.Router();
const HomeData = require('../models/HomeData');
const protect = require('../middlewares/authMiddleware');

// @route   GET /api/home
// @desc    Get home page data (skills)
router.get('/', async (req, res) => {
  try {
    let data = await HomeData.findOne();
    // Agar database me kuch nahi hai, toh default create kar do
    if (!data) {
      data = await HomeData.create({
        skills: ['React.js', 'Node.js', 'Tailwind CSS v4', 'Express', 'MySQL', 'MongoDB']
      });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/home
// @desc    Update home page data (Admin only)
router.put('/', protect, async (req, res) => {
  try {
    let data = await HomeData.findOne();
    if (data) {
      data.skills = req.body.skills;
      await data.save();
    } else {
      data = await HomeData.create({ skills: req.body.skills });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});

module.exports = router;