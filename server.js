const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({ origin: 'https://mdusmanakukara.vercel.app/' })); 
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.log('MongoDB Connection Failed:', err));

// Routes import
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const homeRoutes = require('./routes/home');
const aboutRoutes = require('./routes/about');
const serviceRoutes = require('./routes/services');
const contactRoutes = require('./routes/contact');

const path = require('path');
const uploadRoutes = require('./routes/upload');

// Setup API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contact', contactRoutes);



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Portfolio API with MongoDB is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});