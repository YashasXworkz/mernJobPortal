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

// Virtual for applicant count
jobSchema.virtual("applicantCount").get(function () {
  return this.applicants ? this.applicants.length : 0;
});

module.exports = mongoose.model("Job", jobSchema);
