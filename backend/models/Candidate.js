const mongoose = require('mongoose');
const CandidateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: String,
  profession: String,
  skills: [String],
  experienceYears: Number,
  city: String,
  resumeFiles: [{ url: String, name: String, type: String }],
  portfolio: [{ type: String, url: String, title: String }],
  acceptedTnC: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});
module.exports = mongoose.model('Candidate', CandidateSchema);
