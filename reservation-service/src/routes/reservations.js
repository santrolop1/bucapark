const express = require('express');
const router = express.Router();

const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  approveReservation,
  rejectReservation,
  cancelReservation,
} = require('../controllers/reservationController');

router.get('/test', (_req, res) => {
  res.json({ success: true, service: 'reservation-service' });
});

// Ciudadano: crear y ver sus reservas
router.post('/', authMiddleware, createReservation);
router.get('/my', authMiddleware, getMyReservations);

// Ciudadano: cancelar su propia reserva (solo si esta Pendiente)
router.delete('/:id', authMiddleware, cancelReservation);

// Admin/operario: ver todas, aprobar, rechazar
router.get('/', authMiddleware, requireRole('admin', 'operario'), getAllReservations);
router.patch('/:id/approve', authMiddleware, requireRole('admin', 'operario'), approveReservation);
router.patch('/:id/reject', authMiddleware, requireRole('admin', 'operario'), rejectReservation);

module.exports = router;
