const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const protect = require('../middlewares/authMiddleware');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    // createdAt: -1 ka matlab hai latest project pehle aayega
    const projects = await Project.find().sort({ createdAt: -1 }); 
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/projects
// @desc    Add a new project
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const newProject = await Project.create(req.body);
    res.status(201).json({ 
      success: true, 
      message: 'Project added successfully!',
      data: newProject 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add project', error: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update an existing project
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true } // new: true updated document return karta hai
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Project updated successfully!',
      data: project 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update project', error: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ success: true, message: 'Project deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete project', error: error.message });
  }
});

module.exports = router;