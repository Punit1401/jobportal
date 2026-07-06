const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Candidate = require('../models/Candidate');
const Job = require('../models/job');
const multer = require('multer');

// Multer setup for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -------------------
// Apply to a job
// -------------------
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const { jobId, candidateId, name, email, phone, linkedIn, portfolio, pricing, timeRequired, additionalInfo } = req.body;
    const file = req.file;

    if (!jobId || !candidateId || !name || !email || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prevent duplicate application
    const exists = await Application.findOne({ job: jobId, candidate: candidateId });
    if (exists) return res.status(400).json({ error: 'Already applied' });

    // Fetch job metadata
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const app = await Application.create({
      job: job._id,
      candidate: candidateId,
      name,
      email,
      phone: phone || "",
      linkedIn: linkedIn || "",
      portfolio: portfolio || "",
      price: pricing || 0,
      estimatedDays: timeRequired || 0,
      coverLetter: additionalInfo || "",
      attachments: [{
        url: "", // Optional: you can store in cloud storage and put URL here
        name: file.originalname,
      }],
      jobCategory: job.jobCategory,
      jobType: job.type,
      experienceLevel: job.experienceLevel
    });

    res.status(201).json({ message: 'Application submitted', application: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// -------------------
// Get applications (Admin)
// -------------------
router.get('/', async (req, res) => {
  try {
    const { jobId, status } = req.query;
    const filter = {};
    if (jobId) filter.job = jobId;
    if (status) filter.status = status;

    const apps = await Application.find(filter)
      .populate('candidate', 'name email phone linkedIn portfolio')
      .populate('job', 'title jobCategory type experienceLevel');

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// -------------------
// Update application status (Admin)
// -------------------
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!app) return res.status(404).json({ error: 'Application not found' });
    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// -------------------
// Delete application (Admin)
// -------------------
router.delete('/:id', async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    res.json({ message: 'Application deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
