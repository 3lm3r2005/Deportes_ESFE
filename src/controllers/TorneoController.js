const Torneo = require('../models/Torneo');

const crearTorneo = async (req, res) => {
  try {
    const nuevoTorneo = new Torneo(req.body);
    await nuevoTorneo.save();
    res.status(201).json(nuevoTorneo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listarTorneos = async (req, res) => {
  try {
    const torneos = await Torneo.find();
    res.status(200).json(torneos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerTorneo = async (req, res) => {
  try {
    const torneo = await Torneo.findById(req.params.id);
    if (!torneo) {
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }
    res.status(200).json(torneo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarTorneo = async (req, res) => {
  try {
    const torneo = await Torneo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!torneo) {
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }
    res.status(200).json(torneo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarTorneo = async (req, res) => {
  try {
    const torneo = await Torneo.findByIdAndDelete(req.params.id);
    if (!torneo) {
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }
    res.status(200).json({ mensaje: 'Torneo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearTorneo,
  listarTorneos,
  obtenerTorneo,
  actualizarTorneo,
  eliminarTorneo
};