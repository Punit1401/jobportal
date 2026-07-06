require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/jobs', require('./routes/adminJobs'));
app.use('/api/candidate', require('./routes/candidate'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/uploads', require('./routes/uploads'));

// Health check
app.get('/', (req, res) => res.send('Shivengroup Recruit API'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
