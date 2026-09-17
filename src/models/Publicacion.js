const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
  autor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  autor_nombre: { type: String, required: true },
  autor_foto: { type: String },
  mensaje: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'El comentario no puede estar vacío']
  },
  fecha: { type: Date, default: Date.now }
});

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
  },
  comentarios: [comentarioSchema]
}, { timestamps: true });

module.exports = mongoose.model('Publicacion', publicacionSchema);