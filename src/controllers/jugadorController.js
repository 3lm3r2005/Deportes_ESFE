const Jugador = require('../models/Jugador');

const crearJugador = async (req, res) => {
  try {
    const nuevoJugador = new Jugador(req.body);
    await nuevoJugador.save();
    res.status(201).json(nuevoJugador);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listarJugadores = async (req, res) => {
  try {
    const jugadores = await Jugador.find();
    res.status(200).json(jugadores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerJugador = async (req, res) => {
  try {
    const jugador = await Jugador.findById(req.params.id);
    if (!jugador) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.status(200).json(jugador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarJugador = async (req, res) => {
  try {
    const jugador = await Jugador.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!jugador) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.status(200).json(jugador);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarJugador = async (req, res) => {
  try {
    const jugador = await Jugador.findByIdAndDelete(req.params.id);
    if (!jugador) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    res.status(200).json({ mensaje: 'Jugador eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearJugador,
  listarJugadores,
  obtenerJugador,
  actualizarJugador,
  eliminarJugador
};