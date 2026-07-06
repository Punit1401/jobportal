const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This route is optional if using NextAuth on frontend. Provide token exchange if OAuth done client-side.
router.post('/token', async (req,res)=>{
  // body: { email, name, googleId, avatar }
  const { email, name, googleId, avatar } = req.body;
  try {
    let user = await User.findOne({ email });
    if(!user){
      user = await User.create({ email, name, googleId, avatar });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch(err){ res.status(500).json({ error: err.message }) }
});

module.exports = router;
