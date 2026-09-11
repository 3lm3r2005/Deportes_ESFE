const Equipo = require('../models/Equipo');

const crearEquipo = async (req, res) => {
  try {
    const nuevoEquipo = new Equipo(req.body);
    await nuevoEquipo.save();
    res.status(201).json(nuevoEquipo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listarEquipos = async (req, res) => {
  try {
    const equipos = await Equipo.find();
    res.status(200).json(equipos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id);
    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.status(200).json(equipo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.status(200).json(equipo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findByIdAndDelete(req.params.id);
    if (!equipo) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.status(200).json({ mensaje: 'Equipo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearEquipo,
  listarEquipos,
  obtenerEquipo,
  actualizarEquipo,
  eliminarEquipo
};