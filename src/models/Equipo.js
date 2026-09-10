const mongoose = require('mongoose');

// Subdocumento: jugador dentro de un equipo
const equipoJugadorSchema = new mongoose.Schema({
  jugador_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    required: true
  },
  dorsal: { type: Number, required: true },
  estado: {
    type: String,
    enum: ['titular', 'reserva', 'baja'],
    default: 'reserva'
  },
  fecha_alta: { type: Date, required: true }
}, { _id: false });

const equipoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  carrera: { type: String, required: true },
  anio: { type: Number, required: true },
  delegado_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  capitan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador'
  },
  jugadores_inscritos: [equipoJugadorSchema]
}, { timestamps: true });

module.exports = mongoose.model('Equipo', equipoSchema);