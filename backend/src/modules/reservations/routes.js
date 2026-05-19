const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../../middleware/auth');
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  approveReservation,
  rejectReservation,
  cancelReservation,
} = require('./controller');

router.get('/test', (_req, res) => res.json({ success: true, service: 'reservations' }));

router.post('/', authMiddleware, createReservation);
router.get('/my', authMiddleware, getMyReservations);
router.delete('/:id', authMiddleware, cancelReservation);

router.get('/', authMiddleware, requireRole('admin', 'operario'), getAllReservations);
router.patch('/:id/approve', authMiddleware, requireRole('admin', 'operario'), approveReservation);
router.patch('/:id/reject', authMiddleware, requireRole('admin', 'operario'), rejectReservation);

module.exports = router;
