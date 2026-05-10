const Reservation = require("../models/Reservation");

const createReservation = async (
  req,
  res
) => {
  try {
    const {
      parkId,
      fecha,
      horaInicio,
      horaFin,
    } = req.body;

    if (horaInicio >= horaFin) {
      return res.status(400).json({
        success: false,
        error:
          "La hora de fin debe ser posterior a la hora de inicio",
      });
    }

    const conflicto =
      await Reservation.findOne({
        parkId,
        fecha,
        $and: [
          {
            horaInicio: {
              $lt: horaFin,
            },
          },
          {
            horaFin: {
              $gt: horaInicio,
            },
          },
        ],
      });

    if (conflicto) {
      return res.status(409).json({
        success: false,
        error:
          "Ya existe una reserva en ese horario",
      });
    }

    const reservation =
      await Reservation.create({
        userId: req.user.userId,
        parkId,
        fecha,
        horaInicio,
        horaFin,
      });

    res.status(201).json({
      success: true,
      message:
        "Reserva creada correctamente",
      data: reservation,
    });
  } catch (error) {
    console.error(
      "Error creando reserva:",
      error.message
    );

    res.status(500).json({
      success: false,
      error:
        "Error interno del servidor",
    });
  }
};

const getReservations = async (
  req,
  res
) => {
  try {
    const reservations =
      await Reservation.find();

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getMyReservations = async (
  req,
  res
) => {
  try {
    const reservations =
      await Reservation.find({
        userId: req.user.userId,
      });

    res.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteReservation = async (
  req,
  res
) => {
  try {
    const reservation =
      await Reservation.findByIdAndDelete(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error:
          "Reserva no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Reserva eliminada",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createReservation,
  getReservations,
  getMyReservations,
  deleteReservation,
};