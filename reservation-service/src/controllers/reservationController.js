const Reservation = require("../models/Reservation");

const createReservation = async (
  req,
  res
) => {

  try {

    const {
      parkId,
      espacio,
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
        espacio,
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
          "Ya existe una reserva en ese horario para este espacio",
      });
    }

    const reservation =
      await Reservation.create({

        userId:
          req.user.userId,

        parkId,
        espacio,
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

      error:
        error.message,
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

        userId:
          req.user.userId,
      });

    res.json({

      success: true,

      data: reservations,
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error:
        error.message,
    });
  }
};

const approveReservation = async (
  req,
  res
) => {

  try {

    const reservation =
      await Reservation.findByIdAndUpdate(

        req.params.id,

        {
          estado: 'Aprobada',
        },

        {
          new: true,
        }
      );

    if (!reservation) {

      return res.status(404).json({

        success: false,

        error:
          'Reserva no encontrada',
      });
    }

    res.json({

      success: true,

      message:
        'Reserva aprobada',

      data: reservation,
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error:
        error.message,
    });
  }
};

const rejectReservation = async (
  req,
  res
) => {

  try {

    const reservation =
      await Reservation.findByIdAndUpdate(

        req.params.id,

        {
          estado: 'Rechazada',
        },

        {
          new: true,
        }
      );

    if (!reservation) {

      return res.status(404).json({

        success: false,

        error:
          'Reserva no encontrada',
      });
    }

    res.json({

      success: true,

      message:
        'Reserva rechazada',

      data: reservation,
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error:
        error.message,
    });
  }
};

const deleteReservation = async (
  req,
  res
) => {

  try {

    const reservation =
      await Reservation.findByIdAndUpdate(

        req.params.id,

        {
          estado: 'Cancelada',
        },

        {
          new: true,
        }
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

      message:
        "Reserva cancelada",

      data: reservation,
    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error:
        error.message,
    });
  }
};

module.exports = {

  createReservation,
  getReservations,
  getMyReservations,
  approveReservation,
  rejectReservation,
  deleteReservation,
};