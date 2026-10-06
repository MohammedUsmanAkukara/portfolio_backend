const express = require('express');
const router = express.Router();
const AboutData = require('../models/AboutData');
const protect = require('../middlewares/authMiddleware');

// @route   GET /api/about
// @desc    Get About Page Data
router.get('/', async (req, res) => {
  try {
    let data = await AboutData.findOne();
    
    // Agar DB khali hai, toh default data insert kar do (Aapki real details)
    if (!data) {
      data = await AboutData.create({
        bio: "I am a Full-Stack Web Developer & Designer dedicated to crafting scalable, efficient, and visually stunning digital experiences. My core expertise lies in building robust web applications from the ground up—architecting secure backend systems with Node.js and MySQL, and designing reactive, modern UIs with React and Tailwind CSS.\n\nI believe in clean code, seamless user experiences, and the continuous pursuit of learning.",
        location: "Raipur, Chhattisgarh",
        education: "BCA - 2023",
        experiences: [
          { title: "Freelance Web Developer", period: "Present" },
          { title: "Mahindra Travels", period: "2018 - 2021" }
        ]
      });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/about
// @desc    Update About Page Data (Admin only)
router.put('/', protect, async (req, res) => {
  try {
    let data = await AboutData.findOne();
    if (data) {
      data.bio = req.body.bio;
      data.location = req.body.location;
      data.education = req.body.education;
      data.experiences = req.body.experiences;
      await data.save();
    } else {
      data = await AboutData.create(req.body);
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
});

module.exports = router;