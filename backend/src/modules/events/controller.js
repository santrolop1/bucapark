const Event = require('./model');

const createEvent = async (req, res) => {
  try {
    const { nombre, descripcion, fecha, horaInicio, horaFin, espacio, parkId } = req.body;

    if (horaInicio >= horaFin) {
      return res.status(400).json({ success: false, error: 'La hora final debe ser mayor' });
    }

    const event = await Event.create({ nombre, descripcion, fecha, horaInicio, horaFin, espacio, parkId, organizadorId: req.user.userId });
    res.status(201).json({ success: true, message: 'Evento creado correctamente', data: event });
  } catch (error) {
    console.error('Error creando evento:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

const getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({ estado: 'Aprobado' });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizadorId: req.user.userId });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { estado: 'Aprobado' }, { new: true });
    if (!event) return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    res.json({ success: true, message: 'Evento aprobado', data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { estado: 'Rechazado' }, { new: true });
    if (!event) return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    res.json({ success: true, message: 'Evento rechazado', data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createEvent, getPublicEvents, getMyEvents, approveEvent, rejectEvent };
