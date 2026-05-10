const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'El ID de usuario es requerido'],
    },

    parkId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'El ID del parque es requerido'],
    },

    fecha: {
      type: Date,
      required: [true, 'La fecha es requerida'],
    },

    horaInicio: {
      type: String,
      required: [true, 'La hora de inicio es requerida'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'],
    },

    horaFin: {
      type: String,
      required: [true, 'La hora de fin es requerida'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'],
    },

    estado: {
      type: String,
      enum: ['Pendiente', 'Aprobada', 'Rechazada'],
      default: 'Pendiente',
    },

    motivo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: {
      createdAt: 'creado_en',
      updatedAt: 'actualizado_en',
    },
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// Índice para detección rápida de cruces de horario
reservationSchema.index({ parkId: 1, fecha: 1, horaInicio: 1, horaFin: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);