const mongoose = require('mongoose');

const TIPOS_ESPACIO = ['cancha-futbol', 'basquetbol', 'auditorio', 'yoga', 'picnic-bbq'];

const reservationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    parkId: { type: String, required: true },
    tipoEspacio: { type: String, required: [true, 'El tipo de espacio es requerido'], enum: TIPOS_ESPACIO },
    fecha: { type: Date, required: [true, 'La fecha es requerida'] },
    horaInicio: { type: String, required: [true, 'La hora de inicio es requerida'] },
    duracion: { type: Number, required: [true, 'La duración es requerida'], min: 1, max: 4 },
    personas: { type: Number, required: [true, 'El número de personas es requerido'], min: 1 },
    proposito: { type: String, required: [true, 'El propósito es requerido'], trim: true },
    notas: { type: String, default: '', trim: true },
    precioTotal: { type: Number, default: 0 },
    estado: {
      type: String,
      enum: ['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada'],
      default: 'Pendiente',
    },
  },
  {
    timestamps: { createdAt: 'creado_en', updatedAt: 'actualizado_en' },
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Reservation', reservationSchema, 'reservas');
