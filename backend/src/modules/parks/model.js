const mongoose = require('mongoose');

const parkSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    direccion: { type: String, required: true },
    ciudad: { type: String, default: 'Bucaramanga' },
    descripcion: { type: String, default: '' },
    estado: {
      type: String,
      default: 'Activo',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Park', parkSchema, 'parques');
