const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      required: true,
    },
    salary: {
      min: Number,
      max: Number,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: String,
      enum: ["entry", "mid", "senior", "lead", "executive"],
    },
    benefits: [String],
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired", "filled"],
      default: "active",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Simple text search index
jobSchema.index({ title: "text", description: "text", company: "text" });

// Performance indexes for common queries
jobSchema.index({ status: 1, createdAt: -1 }); // Active jobs listing (most common query)
jobSchema.index({ location: 1, type: 1 }); // Filter by location and type
jobSchema.index({ skills: 1 }); // Skills-based search
jobSchema.index({ postedBy: 1, status: 1 }); // Employer's jobs
jobSchema.index({ "salary.min": 1, "salary.max": 1 }); // Salary range queries

module.exports = mongoose.model("Job", jobSchema);
