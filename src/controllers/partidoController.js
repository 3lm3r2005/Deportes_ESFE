const Partido = require('../models/Partido');
const Torneo = require('../models/Torneo');
const Equipo = require('../models/Equipo');

const validarGolesJugadores = (partidoData) => {
  const { goles_local, goles_visitante, estadisticas_jugadores, equipo_local_id, equipo_visitante_id } = partidoData;
  if (!estadisticas_jugadores || !Array.isArray(estadisticas_jugadores)) return null;

  const golesPorEquipo = {};
  for (const s of estadisticas_jugadores) {
    if (s.goles && s.goles < 0) {
      return 'Los goles de un jugador no pueden ser negativos';
    }
    const eqId = s.equipo_id ? s.equipo_id.toString() : null;
    if (eqId) {
      golesPorEquipo[eqId] = (golesPorEquipo[eqId] || 0) + (Number(s.goles) || 0);
    }
  }

  if (equipo_local_id && goles_local !== undefined) {
    const totalLocal = golesPorEquipo[equipo_local_id.toString()] || 0;
    if (totalLocal > Number(goles_local)) {
      return `Los goles individuales del equipo local (${totalLocal}) no pueden superar el marcador del equipo (${goles_local})`;
    }
  }

  if (equipo_visitante_id && goles_visitante !== undefined) {
    const totalVisitante = golesPorEquipo[equipo_visitante_id.toString()] || 0;
    if (totalVisitante > Number(goles_visitante)) {
      return `Los goles individuales del equipo visitante (${totalVisitante}) no pueden superar el marcador del equipo (${goles_visitante})`;
    }
  }

  return null;
};

const crearPartido = async (req, res) => {
  try {
    const { torneo_id, equipo_local_id, equipo_visitante_id } = req.body;

    if (equipo_local_id === equipo_visitante_id) {
      return res.status(400).json({ error: 'Un equipo no puede jugar contra sí mismo' });
    }

    const errorGoles = validarGolesJugadores(req.body);
    if (errorGoles) {
      return res.status(400).json({ error: errorGoles });
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
    const { page, limit, estado } = req.query;
    const usarPaginacion = page || limit;

    const filtro = {};
    if (req.usuario.rol === 'arbitro') {
      filtro.arbitro_id = req.usuario.id;
    }
    if (estado) {
      filtro.estado = estado;
    }

    if (!usarPaginacion) {
      const partidos = await Partido.find(filtro);
      return res.status(200).json(partidos);
    }

    const pagina = parseInt(page) || 1;
    const limite = parseInt(limit) || 10;
    const saltar = (pagina - 1) * limite;

    const total = await Partido.countDocuments(filtro);
    const partidos = await Partido.find(filtro).skip(saltar).limit(limite);

    res.status(200).json({
      partidos,
      total,
      totalPaginas: Math.ceil(total / limite),
      pagina,
    });
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
    const partidoActual = await Partido.findById(req.params.id);
    if (!partidoActual) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    if (req.usuario.rol === 'arbitro' && partidoActual.arbitro_id.toString() !== req.usuario.id) {
      return res.status(403).json({ error: 'No eres el árbitro asignado a este partido' });
    }

    const equipoLocalId = req.body.equipo_local_id || partidoActual.equipo_local_id.toString();
    const equipoVisitanteId = req.body.equipo_visitante_id || partidoActual.equipo_visitante_id.toString();
    const torneoId = req.body.torneo_id || partidoActual.torneo_id.toString();

    if (equipoLocalId === equipoVisitanteId) {
      return res.status(400).json({ error: 'Un equipo no puede jugar contra sí mismo' });
    }

    if (req.body.equipo_local_id || req.body.equipo_visitante_id || req.body.torneo_id) {
      const torneo = await Torneo.findById(torneoId);
      if (!torneo) {
        return res.status(400).json({ error: 'El torneo indicado no existe' });
      }

      const equipoLocal = await Equipo.findById(equipoLocalId);
      if (!equipoLocal) {
        return res.status(400).json({ error: 'El equipo local indicado no existe' });
      }

      const equipoVisitante = await Equipo.findById(equipoVisitanteId);
      if (!equipoVisitante) {
        return res.status(400).json({ error: 'El equipo visitante indicado no existe' });
      }

      const idsInscritos = torneo.equipos_inscritos
        .filter((e) => e.estado === 'inscrito')
        .map((e) => e.equipo_id.toString());

      if (!idsInscritos.includes(equipoLocalId)) {
        return res.status(400).json({ error: 'El equipo local no está inscrito en ese torneo' });
      }
      if (!idsInscritos.includes(equipoVisitanteId)) {
        return res.status(400).json({ error: 'El equipo visitante no está inscrito en ese torneo' });
      }
    }

    const datosFusionados = {
      ...partidoActual.toObject(),
      ...req.body,
    };
    const errorGoles = validarGolesJugadores(datosFusionados);
    if (errorGoles) {
      return res.status(400).json({ error: errorGoles });
    }

    const partido = await Partido.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
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