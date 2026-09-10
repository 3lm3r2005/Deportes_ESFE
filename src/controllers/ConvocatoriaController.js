const Convocatoria = require('../models/Convocatoria');

const crearConvocatoria = async (req, res) => {
  try {
    const nuevaConvocatoria = new Convocatoria(req.body);
    await nuevaConvocatoria.save();
    res.status(201).json(nuevaConvocatoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listarConvocatorias = async (req, res) => {
  try {
    const convocatorias = await Convocatoria.find();
    res.status(200).json(convocatorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerConvocatoria = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findById(req.params.id);
    if (!convocatoria) {
      return res.status(404).json({ error: 'Convocatoria no encontrada' });
    }
    res.status(200).json(convocatoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarConvocatoria = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!convocatoria) {
      return res.status(404).json({ error: 'Convocatoria no encontrada' });
    }
    res.status(200).json(convocatoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarConvocatoria = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findByIdAndDelete(req.params.id);
    if (!convocatoria) {
      return res.status(404).json({ error: 'Convocatoria no encontrada' });
    }
    res.status(200).json({ mensaje: 'Convocatoria eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearConvocatoria,
  listarConvocatorias,
  obtenerConvocatoria,
  actualizarConvocatoria,
  eliminarConvocatoria
};