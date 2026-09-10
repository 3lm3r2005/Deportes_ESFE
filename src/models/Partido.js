const mongoose = require('mongoose');

// Subdocumento: estadísticas de un jugador en un partido
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
  goles: { type: Number, default: 0 },
  tarjetas_amarillas: { type: Number, default: 0 },
  tarjetas_rojas: { type: Number, default: 0 }
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
  hora: { type: String, required: true },
  estado: {
    type: String,
    enum: ['programado', 'en_juego', 'finalizado'],
    default: 'programado'
  },
  goles_local: { type: Number, default: 0 },
  goles_visitante: { type: Number, default: 0 },
  estadisticas_jugadores: [partidoJugadorStatsSchema]
}, { timestamps: true });

module.exports = mongoose.model('Partido', partidoSchema);