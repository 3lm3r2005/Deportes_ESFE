const mongoose = require('mongoose');

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
    required: true,
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  anio: {
    type: Number,
    required: true,
    min: [2020, 'Año inválido'],
    max: [2100, 'Año inválido']
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