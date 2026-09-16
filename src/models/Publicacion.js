const mongoose = require('mongoose');

const publicacionSchema = new mongoose.Schema({
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
  imagen_url: { type: String },
  autor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  fecha_publicacion: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Publicacion', publicacionSchema);