const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const registrar = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      email,
      password_hash,
      rol,
      estado: 'activo'
    });

    await nuevoUsuario.save();

    const usuarioSinPassword = nuevoUsuario.toObject();
    delete usuarioSinPassword.password_hash;

    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { registrar };