
const mongoose = require("mongoose");

const parkSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    direccion: {
      type: String,
      required: true,
    },

    ciudad: {
      type: String,
      default: "Bucaramanga",
    },

    descripcion: {
      type: String,
      default: "",
    },

    estado: {
      type: String,
      enum: ["activo", "mantenimiento"],
      default: "activo",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Park", parkSchema, "parques");