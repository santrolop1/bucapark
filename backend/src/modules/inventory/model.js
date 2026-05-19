const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    cantidad: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ['Disponible', 'Dañado', 'Perdido'],
      default: 'Disponible',
    },
    parkId: { type: String, required: true },
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

module.exports = mongoose.model('Inventory', inventorySchema, 'inventarios');
