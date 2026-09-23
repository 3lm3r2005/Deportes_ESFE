const Equipo = require('../models/Equipo');
const Partido = require('../models/Partido');

const crearEquipo = async (req, res) => {
  try {
    const { delegado_id, jugadores_inscritos } = req.body;

    if (req.usuario.rol === 'delegado' && delegado_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Un delegado solo puede asignarse a sí mismo como delegado del equipo' });
    }

    if (delegado_id) {
      const yaAsignado = await Equipo.findOne({ delegado_id });
      if (yaAsignado) {
        return res.status(400).json({ error: 'Este delegado ya está asignado a otro equipo' });
      }
    }

    if (jugadores_inscritos && Array.isArray(jugadores_inscritos)) {
      const dorsalesActivos = jugadores_inscritos
        .filter((j) => j.estado !== 'baja')
        .map((j) => Number(j.dorsal));
      const dorsalesUnicos = new Set(dorsalesActivos);
      if (dorsalesUnicos.size !== dorsalesActivos.length) {
        return res.status(400).json({ error: 'No pueden haber dos jugadores con el mismo número de dorsal en el equipo' });
      }
    }

    const nuevoEquipo = new Equipo(req.body);
    await nuevoEquipo.save();
    res.status(201).json(nuevoEquipo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listarEquipos = async (req, res) => {
  try {
    if (req.usuario.rol === 'delegado') {
      const equipos = await Equipo.find({ delegado_id: req.usuario.id });
      return res.status(200).json(equipos);
    }

    const { page, limit } = req.query;
    const usarPaginacion = page || limit;

    if (!usarPaginacion) {
      const equipos = await Equipo.find();
      return res.status(200).json(equipos);
    }

    const pagina = parseInt(page) || 1;
    const limite = parseInt(limit) || 10;
    const saltar = (pagina - 1) * limite;

    const total = await Equipo.countDocuments();
    const equipos = await Equipo.find().skip(saltar).limit(limite);

    res.status(200).json({
      equipos,
      total,
      totalPaginas: Math.ceil(total / limite),
      pagina,
    });
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
    const { delegado_id } = req.body;

    const equipoActual = await Equipo.findById(req.params.id);
    if (!equipoActual) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    if (req.usuario.rol === 'delegado' && equipoActual.delegado_id.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo puedes editar tu propio equipo' });
    }

    if (req.usuario.rol === 'delegado' && delegado_id !== undefined && delegado_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Un delegado solo puede asignarse a sí mismo como delegado del equipo' });
    }

    if (delegado_id) {
      const yaAsignado = await Equipo.findOne({
        delegado_id,
        _id: { $ne: req.params.id },
      });
      if (yaAsignado) {
        return res.status(400).json({ error: 'Este delegado ya está asignado a otro equipo' });
      }
    }

    if (req.body.jugadores_inscritos && Array.isArray(req.body.jugadores_inscritos)) {
      const dorsalesActivos = req.body.jugadores_inscritos
        .filter((j) => j.estado !== 'baja')
        .map((j) => Number(j.dorsal));
      const dorsalesUnicos = new Set(dorsalesActivos);
      if (dorsalesUnicos.size !== dorsalesActivos.length) {
        return res.status(400).json({ error: 'No pueden haber dos jugadores con el mismo número de dorsal en el equipo' });
      }
    }

    const equipo = await Equipo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(equipo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const eliminarEquipo = async (req, res) => {
  try {
    const tienePartidos = await Partido.findOne({
      $or: [{ equipo_local_id: req.params.id }, { equipo_visitante_id: req.params.id }],
    });
    if (tienePartidos) {
      return res.status(400).json({ error: 'No se puede eliminar el equipo porque tiene partidos registrados en el sistema' });
    }

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