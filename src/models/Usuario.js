const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
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
    enum: ['admin', 'arbitro', 'delegado'],
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

// Campo virtual: no se guarda en la BD, solo existe temporalmente
// mientras se crea/actualiza el usuario, para poder encriptarlo.
usuarioSchema.virtual('password').set(function (password) {
  this._password = password;
});

// Se ejecuta ANTES de la validación (por eso pre('validate') y no pre('save')):
// si alguien mandó "password" en texto plano, lo encripta automáticamente
// y lo guarda en password_hash. Así, sin importar desde qué controlador se
// cree un usuario, SIEMPRE queda encriptado.
usuarioSchema.pre('validate', async function () {
  if (this._password) {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this._password, salt);
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
