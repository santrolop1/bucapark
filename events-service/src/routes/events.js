const express = require('express');

const router = express.Router();

const {
  authMiddleware,
  requireRole,
} = require('../middleware/authMiddleware');

const {
  createEvent,
  getPublicEvents,
  getMyEvents,
  approveEvent,
  rejectEvent,
} = require('../controllers/eventController');

router.post(
  '/',
  authMiddleware,
  createEvent
);

router.get(
  '/public',
  getPublicEvents
);

router.get(
  '/my',
  authMiddleware,
  getMyEvents
);

router.patch(
  '/:id/approve',
  authMiddleware,
  requireRole('admin'),
  approveEvent
);

router.patch(
  '/:id/reject',
  authMiddleware,
  requireRole('admin'),
  rejectEvent
);

module.exports = router;