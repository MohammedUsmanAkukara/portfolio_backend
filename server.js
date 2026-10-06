const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middlewares
const allowedOrigins = [
  'http://localhost:5173', // Agar Vite use kar rahe ho
  'https://mdusmanakukara.vercel.app' // Aapka live frontend Vercel URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Agar request server se hai (jaise Postman ya server-to-server) toh origin undefined hota hai
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      // Agar origin allowed list me hai
      callback(null, true);
    } else {
      // Agar origin allowed nahi hai
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Agar cookies ya authorization headers bhej rahe ho
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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