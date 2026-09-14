const mongoose = require('mongoose');

const partidoJugadorStatsSchema = new mongoose.Schema({
  jugador_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    required: true
  },
  equipo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  titular: { type: Boolean, default: false },
  goles: { type: Number, default: 0, min: [0, 'Los goles no pueden ser negativos'] },
  tarjetas_amarillas: { type: Number, default: 0, min: [0, 'Las tarjetas no pueden ser negativas'], max: [2, 'Máximo 2 tarjetas amarillas por partido'] },
  tarjetas_rojas: { type: Number, default: 0, min: [0, 'Las tarjetas no pueden ser negativas'], max: [1, 'Máximo 1 tarjeta roja por partido'] }
}, { _id: false });

const partidoSchema = new mongoose.Schema({
  torneo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Torneo',
    required: true
  },
  equipo_local_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  equipo_visitante_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  arbitro_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  fecha: { type: Date, required: true },
  hora: {
    type: String,
    required: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'La hora debe tener formato HH:MM']
  },
  estado: {
    type: String,
    enum: ['programado', 'en_juego', 'finalizado'],
    default: 'programado'
  },
  goles_local: { type: Number, default: 0, min: [0, 'Los goles no pueden ser negativos'] },
  goles_visitante: { type: Number, default: 0, min: [0, 'Los goles no pueden ser negativos'] },
  estadisticas_jugadores: [partidoJugadorStatsSchema]
}, { timestamps: true });

module.exports = mongoose.model('Partido', partidoSchema);