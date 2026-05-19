const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: [2, 'Nombre mínimo 2 caracteres'],
      maxlength: [50, 'Nombre máximo 50 caracteres'],
    },
    apellidos: { type: String, trim: true, default: '' },
    identificacion: { type: String, trim: true, default: '' },
    telefono: { type: String, trim: true, default: '' },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email no válido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'Contraseña mínimo 6 caracteres'],
      select: false,
    },
    rol: {
      type: String,
      enum: ['ciudadano', 'operario', 'admin'],
      default: 'ciudadano',
    },
  },
  {
    timestamps: { createdAt: 'creado_en', updatedAt: 'actualizado_en' },
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema, 'usuarios');
