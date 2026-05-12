const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },

    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
    },

    fecha: {
      type: Date,
      required: [true, 'La fecha es requerida'],
    },

    horaInicio: {
      type: String,
      required: [true, 'La hora de inicio es requerida'],
    },

    horaFin: {
      type: String,
      required: [true, 'La hora de fin es requerida'],
    },

    espacio: {
      type: String,
      required: [true, 'El espacio es requerido'],
      trim: true,
    },

    parkId: {
      type: String,
      required: [true, 'El parkId es requerido'],
    },

    organizadorId: {
      type: String,
      required: true,
    },

    estado: {
      type: String,
      enum: [
        'Pendiente',
        'Aprobado',
        'Rechazado',
      ],
      default: 'Pendiente',
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

module.exports =
  mongoose.model(
    'Event',
    eventSchema,
    'eventos'
  );