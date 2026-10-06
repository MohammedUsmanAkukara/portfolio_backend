const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Project title is required'] 
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'] 
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  image: { 
    type: String, 
    required: [true, 'Image URL is required'] 
  },
  tech: [{ 
    type: String // Array of strings (e.g., ["React.js", "Node.js"])
  }],
  liveLink: { 
    type: String,
    default: ""
  },
  adminLink: { 
    type: String,
    default: "" // Optional field
  }
}, { timestamps: true }); // timestamps automatically createdAt aur updatedAt add kar dega

module.exports = mongoose.model('Project', projectSchema);