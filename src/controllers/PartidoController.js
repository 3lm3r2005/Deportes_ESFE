const Partido = require('../models/Partido');

const crearPartido = async (req, res) => {
  try {
    const nuevoPartido = new Partido(req.body);
    await nuevoPartido.save();
    res.status(201).json(nuevoPartido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listarPartidos = async (req, res) => {
  try {
    const partidos = await Partido.find();
    res.status(200).json(partidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerPartido = async (req, res) => {
  try {
    const partido = await Partido.findById(req.params.id);
    if (!partido) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }
    res.status(200).json(partido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarPartido = async (req, res) => {
  try {
    const partido = await Partido.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!partido) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }
    res.status(200).json(partido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarPartido = async (req, res) => {
  try {
    const partido = await Partido.findByIdAndDelete(req.params.id);
    if (!partido) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }
    res.status(200).json({ mensaje: 'Partido eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearPartido,
  listarPartidos,
  obtenerPartido,
  actualizarPartido,
  eliminarPartido
};