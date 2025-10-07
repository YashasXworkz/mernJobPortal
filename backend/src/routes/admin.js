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

module.exports = router;
