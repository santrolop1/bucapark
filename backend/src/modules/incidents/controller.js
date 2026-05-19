const Incident = require('./model');

const createIncident = async (req, res) => {
  try {
    const { parkId, descripcion, fotografia, ubicacionAprox, nivelUrgencia } = req.body;
    const incident = await Incident.create({ userId: req.user.userId, parkId, descripcion, fotografia, ubicacionAprox, nivelUrgencia });
    res.status(201).json({ success: true, message: 'Incidente reportado correctamente', data: incident });
  } catch (error) {
    console.error('Error creando incidente:', error.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ userId: req.user.userId });
    res.json({ success: true, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json({ success: true, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateIncidentStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    const incident = await Incident.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    if (!incident) return res.status(404).json({ success: false, error: 'Incidente no encontrado' });
    res.json({ success: true, message: 'Estado actualizado', data: incident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createIncident, getMyIncidents, getIncidents, updateIncidentStatus };
