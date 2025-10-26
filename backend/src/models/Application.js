const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  interviewDate: Date,
  interviewNotes: String
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Performance indexes for common queries
applicationSchema.index({ status: 1 }); // Filter by application status
applicationSchema.index({ applicant: 1, appliedAt: -1 }); // User's applications timeline
applicationSchema.index({ job: 1, status: 1 }); // Job's applications by status

module.exports = mongoose.model('Application', applicationSchema);
