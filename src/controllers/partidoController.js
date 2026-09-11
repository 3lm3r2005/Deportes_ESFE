const Partido = require('../models/Partido');
const Torneo = require('../models/Torneo');
const Equipo = require('../models/Equipo');

const crearPartido = async (req, res) => {
  try {
    const { torneo_id, equipo_local_id, equipo_visitante_id } = req.body;

    if (equipo_local_id === equipo_visitante_id) {
      return res.status(400).json({ error: 'Un equipo no puede jugar contra sí mismo' });
    }

    const torneo = await Torneo.findById(torneo_id);
    if (!torneo) {
      return res.status(400).json({ error: 'El torneo indicado no existe' });
    }

    const equipoLocal = await Equipo.findById(equipo_local_id);
    if (!equipoLocal) {
      return res.status(400).json({ error: 'El equipo local indicado no existe' });
    }

    const equipoVisitante = await Equipo.findById(equipo_visitante_id);
    if (!equipoVisitante) {
      return res.status(400).json({ error: 'El equipo visitante indicado no existe' });
    }

    const idsInscritos = torneo.equipos_inscritos
      .filter((e) => e.estado === 'inscrito')
      .map((e) => e.equipo_id.toString());

    if (!idsInscritos.includes(equipo_local_id)) {
      return res.status(400).json({ error: 'El equipo local no está inscrito en ese torneo' });
    }
    if (!idsInscritos.includes(equipo_visitante_id)) {
      return res.status(400).json({ error: 'El equipo visitante no está inscrito en ese torneo' });
    }

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