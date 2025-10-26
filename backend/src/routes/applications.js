const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { auth, requireRole, requireOwnership } = require("../middleware/auth");
const Notification = require("../models/Notification");
const { handleError } = require("../utils/errorHandler");

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
    handleError(error, res, 'POST /api/applications/:jobId');
  }
});

// Fixed route to properly fetch job applications for employers
router.get(
  "/job/:jobId",
  auth,
  requireOwnership(
    (req) => req.params.jobId,
    async (id) => await Job.findById(id)
  ),
  async (req, res) => {
  try {

    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email phone profile")
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    handleError(error, res, 'GET /api/applications/job/:jobId');
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
    handleError(error, res, 'GET /api/applications/my-applications');
  }
});

router.put(
  "/:applicationId",
  auth,
  requireRole("employer"),
  requireOwnership(
    (req) => req.params.applicationId,
    async (id) => {
      // Fetch application and populate job for ownership check
      // Employer owns the JOB, not the application (jobseeker owns application)
      const application = await Application.findById(id).populate("job");
      return application ? application.job : null;
    }
  ),
  async (req, res) => {
  try {
    const { status, notes, interviewDate, interviewNotes } = req.body;

    // Fetch application again with full details (middleware only populates job for ownership check)
    const application = await Application.findById(req.params.applicationId).populate("job");

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
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
    handleError(error, res, 'PUT /api/applications/:applicationId');
  }
});

router.delete(
  "/:applicationId",
  auth,
  requireOwnership(
    (req) => req.params.applicationId,
    async (id) => await Application.findById(id)
  ),
  async (req, res) => {
  try {
    const application = req.resource; // Application is already fetched and ownership verified by middleware

    await Job.findByIdAndUpdate(application.job, {
      $pull: { applicants: application._id },
    });

    await Application.findByIdAndDelete(req.params.applicationId);

    res.json({ message: "Application withdrawn successfully" });
  } catch (error) {
    handleError(error, res, 'DELETE /api/applications/:applicationId');
  }
});

// Update application by job seeker (only pending applications)
router.put(
  "/update/:applicationId",
  auth,
  requireRole("jobseeker"),
  requireOwnership(
    (req) => req.params.applicationId,
    async (id) => await Application.findById(id)
  ),
  async (req, res) => {
  try {
    const { coverLetter, resume } = req.body;
    const applicationId = req.params.applicationId;
    const application = req.resource; // Application is already fetched and ownership verified by middleware

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
    handleError(error, res, 'PUT /api/applications/update/:applicationId');
  }
});

module.exports = router;
