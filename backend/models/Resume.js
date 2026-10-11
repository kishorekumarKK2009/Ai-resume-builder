const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, trim: true, default: 'Untitled Resume' },
  profileSummary: { type: String, trim: true },
  skills: [{ type: String }],
  experience: [{ company: String, position: String, startDate: String, endDate: String, description: String }],
  education: [{ institution: String, degree: String, startDate: String, endDate: String, description: String }]
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
