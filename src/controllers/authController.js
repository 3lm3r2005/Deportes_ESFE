const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const registrar = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    const rolesPermitidosEnRegistroPublico = ['aficionado'];
    if (!rolesPermitidosEnRegistroPublico.includes(rol)) {
      return res.status(400).json({ error: 'El registro público solo permite el rol: aficionado' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    const nuevoUsuario = new Usuario({ nombre, apellido, email, password, rol, estado: 'activo' });
    await nuevoUsuario.save();

    const usuarioSinPassword = nuevoUsuario.toObject();
    delete usuarioSinPassword.password_hash;

    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (usuario.estado !== 'activo') {
      return res.status(403).json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' });
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN, algorithm: 'HS256' }
    );

    const isSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production';
    const sameSiteMode = process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax');

    res.cookie('token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteMode,
      maxAge: 8 * 60 * 60 * 1000
    });

    res.status(200).json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        foto_url: usuario.foto_url
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  const isSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production';
  const sameSiteMode = process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax');

  res.clearCookie('token', {
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSiteMode
  });
  res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
};

module.exports = { registrar, login, logout };