const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const User = require('../models/User');

// Get profile by user id
router.get('/:userId', async (req,res)=>{
  try {
    const c = await Candidate.findOne({ user: req.params.userId }).populate('user');
    res.json(c);
  } catch(err){ res.status(500).json({ error: err.message }); }
});

// Create or update candidate profile
router.post('/:userId', async (req,res)=>{
  try {
    const data = req.body;
    let cand = await Candidate.findOne({ user: req.params.userId });
    if(cand){
      Object.assign(cand, data, { updatedAt: new Date() });
      await cand.save();
    } else {
      cand = await Candidate.create({ ...data, user: req.params.userId });
    }
    res.json(cand);
  } catch(err){ res.status(500).json({ error: err.message }); }
});

module.exports = router;
