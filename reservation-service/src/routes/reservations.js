const express = require("express");

const router = express.Router();

const { body, validationResult } = require('express-validator');

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  createReservation,
  getReservations,
  getMyReservations,
  approveReservation,
  rejectReservation,
  deleteReservation,
} = require("../controllers/reservationController");

const requireRole = (
  ...roles
) => {

  return (
    req,
    res,
    next
  ) => {

    if (
      !roles.includes(
        req.user.rol
      )
    ) {

      return res.status(403).json({
        success: false,
        error: "No autorizado",
      });
    }

    next();
  };
};

router.get(
  "/my",
  authMiddleware,
  getMyReservations
);

router.get(
  "/",
  authMiddleware,
  getReservations
);

router.post(
  "/",
  authMiddleware,
  [
    body('parkId').notEmpty().withMessage('parkId es requerido'),
    body('espacio').notEmpty().withMessage('espacio es requerido'),
    body('fecha').isISO8601().withMessage('fecha debe ser válida'),
    body('horaInicio').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('horaInicio formato HH:MM'),
    body('horaFin').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('horaFin formato HH:MM'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }
    next();
  },
  createReservation
);

router.patch(
  "/:id/approve",
  authMiddleware,
  requireRole("admin"),
  approveReservation
);

router.patch(
  "/:id/reject",
  authMiddleware,
  requireRole("admin"),
  rejectReservation
);

router.delete(
  "/:id",
  authMiddleware,
  deleteReservation
);

module.exports = router;