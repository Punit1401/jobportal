const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shivengroup';

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/jobs', require('./routes/adminJobs'));
app.use('/api/candidate', require('./routes/candidate'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/uploads', require('./routes/uploads'));

// Health check
app.get('/', (req, res) => res.send('Shivengroup Recruit API'));

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

startServer();
