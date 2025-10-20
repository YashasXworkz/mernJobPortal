const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { auth, requireRole } = require("../middleware/auth");
const Notification = require("../models/Notification");

const router = express.Router();

router.post("/:jobId", auth, requireRole("jobseeker"), async (req, res) => {
  try {
    const { coverLetter, resume } = req.body;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      resume,
    });

    await application.save();

    await Job.findByIdAndUpdate(jobId, {
      $push: { applicants: application._id },
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Fixed route to properly fetch job applications for employers
router.get("/job/:jobId", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if user is the job owner (employer) or an admin
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email phone profile")
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/my-applications", auth, requireRole("jobseeker"), async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: "job",
        select: "title company location type",
        populate: {
          path: "postedBy",
          select: "name company.name",
        },
      })
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:applicationId", auth, requireRole("employer"), async (req, res) => {
  try {
    const { status, notes, interviewDate, interviewNotes } = req.body;

    const application = await Application.findById(req.params.applicationId).populate("job");

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const previousStatus = application.status;

    const updateData = { status, reviewedBy: req.user._id, reviewedAt: new Date() };

    if (notes) updateData.notes = notes;
    if (interviewDate) updateData.interviewDate = interviewDate;
    if (interviewNotes) updateData.interviewNotes = interviewNotes;

    const updatedApplication = await Application.findByIdAndUpdate(req.params.applicationId, updateData, {
      new: true,
    }).populate("applicant", "name email phone profile");

    if (status && status !== previousStatus) {
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

      await Notification.create({
        recipient: application.applicant,
        type: "application_status",
        title: "Application status updated",
        message: `Your application for ${application.job.title} is now ${statusLabel}.`,
        metadata: {
          jobId: application.job._id,
          applicationId: application._id,
          status,
        },
      });
    }

    res.json({
      message: "Application updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:applicationId", auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    await Job.findByIdAndUpdate(application.job, {
      $pull: { applicants: application._id },
    });

    await Application.findByIdAndDelete(req.params.applicationId);

    res.json({ message: "Application withdrawn successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update application by job seeker (only pending applications)
router.put("/update/:applicationId", auth, requireRole("jobseeker"), async (req, res) => {
  try {
    const { coverLetter, resume } = req.body;
    const applicationId = req.params.applicationId;

    const application = await Application.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Check if the application belongs to the current user
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only update your own applications" });
    }

    // Only allow updating pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({ error: "You can only update pending applications" });
    }

    // Update fields
    const updateData = {};
    if (coverLetter !== undefined) updateData.coverLetter = coverLetter;
    if (resume !== undefined) updateData.resume = resume;

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('job', 'title company location');

    res.json({ 
      message: "Application updated successfully",
      application: updatedApplication 
    });
  } catch (error) {
    console.error('Failed to update application', error);
    res.status(500).json({ error: "Failed to update application" });
  }
});

module.exports = router;
