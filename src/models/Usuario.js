const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo puede contener letras'],
  },
  apellido: {
    type: String,
    required: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El apellido solo puede contener letras'],
  },
  foto_url: { type: String },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['admin', 'arbitro', 'delegado', 'aficionado'],
    required: true
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  }
}, {
  timestamps: true
});

usuarioSchema.virtual('password').set(function (password) {
  this._password = password;
});

usuarioSchema.pre('validate', async function () {
  if (this._password) {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this._password, salt);
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);