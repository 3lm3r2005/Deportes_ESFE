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
  carne: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Za-z]{2}[0-9]{4,6}$/, 'El carné debe iniciar con 2 letras y tener de 4 a 6 números (ej. PO2026, PO25001)'],
  },
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