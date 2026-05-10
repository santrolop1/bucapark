const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createReservation,
  getReservations,
  getMyReservations,
  deleteReservation,
} = require("../controllers/reservationController");

router.post(
  "/",
  authMiddleware,
  createReservation
);

router.get(
  "/",
  getReservations
);

router.get(
  "/my",
  authMiddleware,
  getMyReservations
);

router.delete(
  "/:id",
  authMiddleware,
  deleteReservation
);

module.exports = router;