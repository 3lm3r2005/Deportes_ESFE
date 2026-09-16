const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo puede contener letras'],
  },
  apellido: {
    type: String,
    required: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El apellido solo puede contener letras'],
  },
  foto_url: { type: String },
  carne: { type: String, required: true, unique: true },
  telefono: {
    type: String,
    required: true,
    match: [/^[0-9]{8}$/, 'El teléfono debe tener exactamente 8 dígitos numéricos'],
  },
  posicion: {
    type: String,
    required: true,
    enum: {
      values: ['Portero', 'Defensa', 'Mediocampista', 'Delantero'],
      message: 'Selecciona una posición válida',
    },
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  }
}, { timestamps: true });

module.exports = mongoose.model('Jugador', jugadorSchema);