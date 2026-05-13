const Park = require("../models/Park");

const ALLOWED_FIELDS = ['nombre', 'direccion', 'ciudad', 'descripcion', 'estado'];

const pickAllowed = (body) =>
  ALLOWED_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) acc[key] = body[key];
    return acc;
  }, {});

exports.getAllParks = async (req, res) => {
  try {
    const parks = await Park.find();
    res.json({ success: true, data: parks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

exports.getParkById = async (req, res) => {
  try {
    const park = await Park.findById(req.params.id);
    if (!park) {
      return res.status(404).json({ success: false, error: 'Parque no encontrado' });
    }
    res.json({ success: true, data: park });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

exports.createPark = async (req, res) => {
  try {
    const { nombre, direccion } = req.body;
    if (!nombre || !direccion) {
      return res.status(400).json({ success: false, error: 'nombre y direccion son requeridos' });
    }
    const park = await Park.create(pickAllowed(req.body));
    res.status(201).json({ success: true, message: 'Parque creado correctamente', data: park });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: msgs.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

exports.updatePark = async (req, res) => {
  try {
    const park = await Park.findByIdAndUpdate(
      req.params.id,
      pickAllowed(req.body),
      { new: true, runValidators: true }
    );
    if (!park) {
      return res.status(404).json({ success: false, error: 'Parque no encontrado' });
    }
    res.json({ success: true, message: 'Parque actualizado', data: park });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, error: msgs.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

exports.deletePark = async (req, res) => {
  try {
    const park = await Park.findByIdAndDelete(req.params.id);
    if (!park) {
      return res.status(404).json({ success: false, error: 'Parque no encontrado' });
    }
    res.json({ success: true, message: 'Parque eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};