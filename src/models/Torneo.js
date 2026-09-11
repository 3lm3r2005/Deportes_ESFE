const mongoose = require('mongoose');

// Subdocumento embebido: datos de un equipo dentro de un torneo específico
const torneoEquipoSchema = new mongoose.Schema({
  equipo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipo',
    required: true
  },
  fecha_inscripcion: {
    type: Date,
    required: true
  },
  firma: {
    type: String
  },
  estado: {
    type: String,
    enum: ['inscrito', 'retirado'],
    default: 'inscrito'
  }
}, { _id: false });

const torneoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  anio: {
    type: Number,
    required: true
  },
  fecha_inicio: {
    type: Date,
    required: true
  },
  fecha_fin: {
    type: Date,
    required: true
  },
  estado: {
    type: String,
    enum: ['planificado', 'activo', 'finalizado'],
    default: 'planificado'
  },
  equipos_inscritos: [torneoEquipoSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Torneo', torneoSchema);