const mongoose = require('mongoose');

const convocatoriaSchema = new mongoose.Schema({
  torneo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Torneo',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'El título debe tener al menos 3 caracteres']
  },
  mensaje: {
    type: String,
    required: true,
    trim: true,
    minlength: [5, 'El mensaje debe tener al menos 5 caracteres']
  },
  fecha_publicacion: { type: Date, required: true },
  fecha_limite: { type: Date },
  estado: {
    type: String,
    enum: ['abierta', 'cerrada'],
    default: 'abierta'
  }
}, { timestamps: true });

module.exports = mongoose.model('Convocatoria', convocatoriaSchema);