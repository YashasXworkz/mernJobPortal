const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { auth, optionalAuth, requireRole, requireOwnership } = require("../middleware/auth");
const { handleError } = require("../utils/errorHandler");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search, location, type, experience, skills, page = 1, limit = 10 } = req.query;

    let query = { status: "active" };

    if (search) {
      // Use $or with regex for partial word matching (e.g., "Dev" matches "DevOps")
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    if (experience) {
      query.experience = experience;
    }

    if (skills) {
      const skillsArray = skills.split(",");
      query.skills = { $in: skillsArray };
    }

    // Include postedBy information in the jobs listing
    const jobs = await Job.find(query)
      .populate("postedBy", "_id company.name company.logo company.location")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    handleError(error, res, 'GET /api/jobs');
  }
});

// Updated job details route to include applicant information for employers and job seekers
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email company.name company.website");

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // For employers who posted the job, populate applicants with full details
    if (req.user && req.user.role === "employer" && job.postedBy._id.toString() === req.user._id.toString()) {
      // Populate the applicants with application details
      await job.populate({
        path: "applicants",
        populate: {
          path: "applicant",
          select: "name email phone profile",
        },
      });
    }
    // For job seekers, populate applicants to check if they've applied
    else if (req.user && req.user.role === "jobseeker") {
      // Populate the applicants with basic info to check application status
      await job.populate({
        path: "applicants",
        select: "applicant",
        populate: {
          path: "applicant",
          select: "_id",
        },
      });
    } else {
      job.applicants = undefined;
    }

    res.json({ job });
  } catch (error) {
    handleError(error, res, 'GET /api/jobs/:id');
  }
});

router.post("/", auth, requireRole("employer"), async (req, res) => {
  try {
    // Process salary data
    const salaryData = {};
    if (req.body.salaryMin) {
      salaryData.min = parseInt(req.body.salaryMin);
    }
    if (req.body.salaryMax) {
      salaryData.max = parseInt(req.body.salaryMax);
    }

    const jobData = {
      title: req.body.title,
      company: req.body.company,
      description: req.body.description,
      requirements: req.body.requirements,
      location: req.body.location,
      type: req.body.type,
      salary: salaryData, // Only include salary if at least one value is provided
      skills: req.body.skills,
      experience: req.body.experience,
      benefits: req.body.benefits,
      applicationDeadline: req.body.applicationDeadline,
      postedBy: req.user._id,
    };

    // Remove undefined fields
    Object.keys(jobData).forEach((key) => {
      if (jobData[key] === undefined) {
        delete jobData[key];
      }
    });

    // Remove salary field if empty
    if (Object.keys(salaryData).length === 0) {
      delete jobData.salary;
    }

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    handleError(error, res, 'POST /api/jobs');
  }
});

// Fixed job update route to properly check permissions
router.put(
  "/:id",
  auth,
  requireOwnership(
    (req) => req.params.id,
    async (id) => await Job.findById(id)
  ),
  async (req, res) => {
  try {
    const job = req.resource; // Job is already fetched and ownership verified by middleware

    // Process salary data
    const salaryData = {};
    if (req.body.salaryMin !== undefined) {
      salaryData.min = req.body.salaryMin ? parseInt(req.body.salaryMin) : undefined;
    }
    if (req.body.salaryMax !== undefined) {
      salaryData.max = req.body.salaryMax ? parseInt(req.body.salaryMax) : undefined;
    }

    const updateData = {
      title: req.body.title,
      company: req.body.company,
      description: req.body.description,
      requirements: req.body.requirements,
      location: req.body.location,
      type: req.body.type,
      experience: req.body.experience,
      skills: req.body.skills,
      benefits: req.body.benefits,
      applicationDeadline: req.body.applicationDeadline,
    };

    // Add salary data if provided
    if (Object.keys(salaryData).length > 0) {
      updateData.salary = salaryData;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Remove salary field if empty
    if (updateData.salary && Object.keys(updateData.salary).length === 0) {
      delete updateData.salary;
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    handleError(error, res, 'PUT /api/jobs/:id');
  }
});

// Enhanced delete route to also remove associated applications
router.delete(
  "/:id",
  auth,
  requireOwnership(
    (req) => req.params.id,
    async (id) => await Job.findById(id)
  ),
  async (req, res) => {
  try {
    const job = req.resource; // Job is already fetched and ownership verified by middleware

    // Delete all applications associated with this job
    await Application.deleteMany({ job: job._id });

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    handleError(error, res, 'DELETE /api/jobs/:id');
  }
});

router.get("/user/my-jobs", auth, requireRole("employer"), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate("applicants", "applicant status appliedAt")
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    handleError(error, res, 'GET /api/jobs/user/my-jobs');
  }
});

module.exports = router;
