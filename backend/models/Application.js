const mongoose = require('mongoose');

const AppSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  
  // Candidate Info
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  linkedIn: { type: String, default: "" },
  portfolio: { type: String, default: "" },

  // Application Info
  status: { type: String, enum: ['applied','shortlisted','interview','offered','hired','rejected'], default: 'applied' },
  coverLetter: { type: String, default: "" },
  attachments: [{ url: String, name: String }], // For resume/file uploads
  price: { type: Number, default: 0 },
  estimatedDays: { type: Number, default: 0 },
  
  jobCategory: { type: String, default: "" },
  jobType: { type: String, default: "" },
  experienceLevel: { type: String, default: "" },

  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Application || mongoose.model('Application', AppSchema);
