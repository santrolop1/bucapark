const Reservation = require('./model');

const ALLOWED_FIELDS = ['parkId', 'tipoEspacio', 'fecha', 'horaInicio', 'duracion', 'personas', 'proposito', 'notas', 'precioTotal'];

const createReservation = async (req, res) => {
  try {
    const body = {};
    ALLOWED_FIELDS.forEach((f) => { if (req.body[f] !== undefined) body[f] = req.body[f]; });

    const missing = ['parkId', 'tipoEspacio', 'fecha', 'horaInicio', 'duracion', 'personas', 'proposito'].filter((f) => !body[f]);
    if (missing.length) {
      return res.status(400).json({ success: false, error: `Campos requeridos faltantes: ${missing.join(', ')}` });
    }

    const reservation = await Reservation.create({ userId: req.user.userId, ...body });
    res.status(201).json({ success: true, message: 'Reserva creada correctamente. Pendiente de aprobación.', data: reservation });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: msgs.join('. ') });
    }
    console.error('Error creando reserva:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.userId }).sort({ creado_en: -1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.estado) filter.estado = req.query.estado;
    if (req.query.parkId) filter.parkId = req.query.parkId;
    const reservations = await Reservation.find(filter).sort({ creado_en: -1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const approveReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, { estado: 'Aprobada' }, { new: true });
    if (!reservation) return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
    res.json({ success: true, message: 'Reserva aprobada', data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const rejectReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, { estado: 'Rechazada' }, { new: true });
    if (!reservation) return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
    res.json({ success: true, message: 'Reserva rechazada', data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!reservation) return res.status(404).json({ success: false, error: 'Reserva no encontrada' });

    if (['Aprobada', 'Rechazada', 'Cancelada'].includes(reservation.estado)) {
      return res.status(400).json({ success: false, error: `No se puede cancelar una reserva en estado "${reservation.estado}"` });
    }

    reservation.estado = 'Cancelada';
    await reservation.save();
    res.json({ success: true, message: 'Reserva cancelada', data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createReservation, getMyReservations, getAllReservations, approveReservation, rejectReservation, cancelReservation };
