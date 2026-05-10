const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createReservation,
  getReservations,
  getMyReservations,
  deleteReservation,
} = require("../controllers/reservationController");

router.get(
  "/my",
  authMiddleware,
  getMyReservations
);

router.get(
  "/",
  getReservations
);

router.post(
  "/",
  authMiddleware,
  createReservation
);

router.delete(
  "/:id",
  authMiddleware,
  deleteReservation
);

module.exports = router;
