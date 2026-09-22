const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const crearUsuario = async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    const usuarioSinPassword = nuevoUsuario.toObject();
    delete usuarioSinPassword.password_hash;
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un usuario registrado con ese correo electrónico' });
    }
    res.status(400).json({ error: error.message });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const usarPaginacion = page || limit;

    if (!usarPaginacion) {
      const usuarios = await Usuario.find().select('-password_hash');
      return res.status(200).json(usuarios);
    }

    const pagina = parseInt(page) || 1;
    const limite = parseInt(limit) || 10;
    const saltar = (pagina - 1) * limite;

    const total = await Usuario.countDocuments();
    const usuarios = await Usuario.find().select('-password_hash').skip(saltar).limit(limite);

    res.status(200).json({
      usuarios,
      total,
      totalPaginas: Math.ceil(total / limite),
      pagina,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password_hash');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const datosActualizar = { ...req.body };

    if (req.params.id === req.usuario.id) {
      if (datosActualizar.rol && datosActualizar.rol !== req.usuario.rol) {
        return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
      }
      if (datosActualizar.estado === 'inactivo') {
        return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
      }
    }

    if (datosActualizar.password) {
      const salt = await bcrypt.genSalt(10);
      datosActualizar.password_hash = await bcrypt.hash(datosActualizar.password, salt);
      delete datosActualizar.password;
    }

    const usuario = await Usuario.findByIdAndUpdate(req.params.id, datosActualizar, {
      new: true,
      runValidators: true
    }).select('-password_hash');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un usuario registrado con ese correo electrónico' });
    }
    res.status(400).json({ error: error.message });
  }
};

const actualizarMiPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      { foto_url: req.body.foto_url },
      { new: true, runValidators: true }
    ).select('-password_hash');

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    if (req.params.id === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta mientras tienes la sesión iniciada' });
    }

    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  actualizarMiPerfil,
  eliminarUsuario
};