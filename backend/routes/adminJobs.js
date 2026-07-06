// routes/adminJobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/job');

// Create job
router.post('/', async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      jobCategory,
      experienceLevel,
      type,
      description,
      requirements,
      published,
      userId
    } = req.body;

    const job = await Job.create({
      title,
      company,
      location,
      jobCategory,
      experienceLevel,
      type,
      description,
      requirements: requirements || "",
      published: published || false,
      createdBy: userId
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit job
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      jobCategory,
      experienceLevel,
      type,
      description,
      requirements,
      published
    } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        title,
        company,
        location,
        jobCategory,
        experienceLevel,
        type,
        description,
        requirements: requirements || "",
        published: published || false,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single job
router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List jobs (admin view)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const filter = q ? { title: { $regex: q, $options: "i" } } : {};
    const jobs = await Job.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
