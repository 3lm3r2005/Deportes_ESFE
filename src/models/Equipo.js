const mongoose = require('mongoose');

const equipoJugadorSchema = new mongoose.Schema({
  jugador_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    required: true
  },
  dorsal: {
    type: Number,
    required: true,
    min: [1, 'El dorsal debe ser mayor a 0'],
    max: [99, 'El dorsal máximo es 99']
  },
  estado: {
    type: String,
    enum: ['titular', 'reserva', 'baja'],
    default: 'reserva'
  },
  fecha_alta: { type: Date, required: true }
}, { _id: false });

const equipoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  carrera: {
    type: String,
    required: true,
    enum: {
      values: [
        'Técnico en Ingeniería Eléctrica',
        'Técnico en Desarrollo de Software',
        'Técnico en Mercadeo',
        'Técnico en Turismo',
      ],
      message: 'Selecciona una carrera válida',
    },
  },
  anio: {
    type: Number,
    required: true,
    min: [2020, 'Año inválido'],
    max: [2100, 'Año inválido']
  },
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