const express = require('express');
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');
const { handleError } = require('../utils/errorHandler');

const router = express.Router();

// Get notifications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications });
  } catch (error) {
    handleError(error, res, 'GET /api/notifications');
  }
});

// Mark a single notification as read
router.patch('/:notificationId/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    handleError(error, res, 'PATCH /api/notifications/:notificationId/read');
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    handleError(error, res, 'PATCH /api/notifications/read-all');
  }
});

module.exports = router;
