const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    parkId: { type: String, required: true },
    descripcion: { type: String, required: [true, 'La descripción es requerida'], trim: true },
    fotografia: { type: String, default: '' },
    ubicacionAprox: { type: String, default: '' },
    nivelUrgencia: {
      type: String,
      enum: ['Bajo', 'Medio', 'Alto'],
      default: 'Medio',
    },
    estado: {
      type: String,
      enum: ['Registrado', 'EnProceso', 'Resuelto'],
      default: 'Registrado',
    },
  },
  {
    timestamps: { createdAt: 'creado_en', updatedAt: 'actualizado_en' },
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Incident', incidentSchema, 'reportes_incidencias');
