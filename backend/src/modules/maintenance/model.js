const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    incidentId: { type: String, default: null },
    parkId: { type: String, required: true },
    descripcion: { type: String, required: true, trim: true },
    operarioId: { type: String, required: true },
    asignadoPor: { type: String, required: true },
    estado: {
      type: String,
      enum: ['Pendiente', 'EnProceso', 'Completada'],
      default: 'Pendiente',
    },
    prioridad: {
      type: String,
      enum: ['Baja', 'Media', 'Alta'],
      default: 'Media',
    },
    fechaAsignacion: { type: Date, default: Date.now },
    fechaResolucion: { type: Date, default: null },
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

module.exports = mongoose.model('Maintenance', maintenanceSchema, 'tareas_mantenimiento');
