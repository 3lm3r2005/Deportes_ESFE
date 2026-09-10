const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
 apellido: { type: String, required: true },
  carne: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  posicion: { type: String, required: true },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  }
}, { timestamps: true });

module.exports = mongoose.model('Jugador', jugadorSchema);