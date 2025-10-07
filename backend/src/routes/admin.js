const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [totalUsers, totalJobseekers, totalEmployers, totalJobs, activeJobs, totalApplications, recentJobs] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Job.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title company location type status createdAt'),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalJobseekers,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications,
      },
      recentJobs,
    });
  } catch (error) {
    console.error('Failed to fetch admin stats', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role phone profile company createdAt')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Failed to fetch users', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/applications', auth, requireAdmin, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('applicant', 'name email role phone profile.location')
      .populate('job', 'title company location type status createdAt')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Failed to fetch applications', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete another admin' });
    }

    if (user.role === 'jobseeker') {
      await Application.deleteMany({ applicant: user._id });
    }

    if (user.role === 'employer') {
      const employerJobs = await Job.find({ postedBy: user._id }).select('_id');
      const jobIds = employerJobs.map((job) => job._id);

      if (jobIds.length > 0) {
        await Application.deleteMany({ job: { $in: jobIds } });
        await Job.deleteMany({ _id: { $in: jobIds } });
      }
    }

    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Create new admin (only existing admins can do this)
router.post('/create-admin', auth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newAdmin = new User({
      name,
      email,
      password,
      role: 'admin'
    });

    await newAdmin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Failed to create admin', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

module.exports = router;
