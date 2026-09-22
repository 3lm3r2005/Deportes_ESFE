const Jugador = require('../models/Jugador');
const Equipo = require('../models/Equipo');

const crearJugador = async (req, res) => {
  try {
    const nuevoJugador = new Jugador(req.body);
    await nuevoJugador.save();
    res.status(201).json(nuevoJugador);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya existe un jugador registrado con ese carné' });
    }
    res.status(400).json({ error: error.message });
  }
};

const listarJugadores = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const usarPaginacion = page || limit;

    if (req.usuario.rol === 'delegado') {
      const equipo = await Equipo.findOne({ delegado_id: req.usuario.id });
      if (!equipo) {
        return res.status(200).json([]);
      }
      const idsJugadores = equipo.jugadores_inscritos.map((j) => j.jugador_id);
      const jugadores = await Jugador.find({ _id: { $in: idsJugadores } });
      return res.status(200).json(jugadores);
    }

    if (!usarPaginacion) {
      const jugadores = await Jugador.find();
      return res.status(200).json(jugadores);
    }

    const pagina = parseInt(page) || 1;
    const limite = parseInt(limit) || 10;
    const saltar = (pagina - 1) * limite;

    const total = await Jugador.countDocuments();
    const jugadores = await Jugador.find().skip(saltar).limit(limite);

    res.status(200).json({
      jugadores,
      total,
      totalPaginas: Math.ceil(total / limite),
      pagina,
    });
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
    if (req.usuario.rol === 'delegado') {
      const equipo = await Equipo.findOne({ delegado_id: req.usuario.id });
      const esDeSuEquipo = equipo?.jugadores_inscritos.some(
        (j) => j.jugador_id.toString() === req.params.id
      );
      if (!esDeSuEquipo) {
        return res.status(403).json({ error: 'Solo puedes editar jugadores de tu propio equipo' });
      }
    }

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
    if (req.usuario.rol === 'delegado') {
      const equipo = await Equipo.findOne({ delegado_id: req.usuario.id });
      const esDeSuEquipo = equipo?.jugadores_inscritos.some(
        (j) => j.jugador_id.toString() === req.params.id
      );
      if (!esDeSuEquipo) {
        return res.status(403).json({ error: 'Solo puedes eliminar jugadores de tu propio equipo' });
      }
    }

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