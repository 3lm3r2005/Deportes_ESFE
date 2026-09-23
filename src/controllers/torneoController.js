const Torneo = require('../models/Torneo');
const Partido = require('../models/Partido');
const Equipo = require('../models/Equipo');
const Jugador = require('../models/Jugador');
const Convocatoria = require('../models/Convocatoria');
const crearTorneo = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.body;

    if (fecha_inicio && fecha_fin && new Date(fecha_fin) < new Date(fecha_inicio)) {
      return res.status(400).json({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
    }

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
    const { fecha_inicio, fecha_fin } = req.body;

    if (fecha_inicio && fecha_fin && new Date(fecha_fin) < new Date(fecha_inicio)) {
      return res.status(400).json({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
    }

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
    const tienePartidos = await Partido.findOne({ torneo_id: req.params.id });
    if (tienePartidos) {
      return res.status(400).json({ error: 'No se puede eliminar el torneo porque tiene partidos programados o disputados' });
    }

    const tieneConvocatorias = await Convocatoria.findOne({ torneo_id: req.params.id });
    if (tieneConvocatorias) {
      return res.status(400).json({ error: 'No se puede eliminar el torneo porque tiene convocatorias vinculadas' });
    }

    const torneo = await Torneo.findByIdAndDelete(req.params.id);
    if (!torneo) {
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }
    res.status(200).json({ mensaje: 'Torneo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const inscribirEquipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipo_id, fecha_inscripcion, firma } = req.body;

    const torneo = await Torneo.findById(id);
    if (!torneo) {
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }

    if (torneo.estado === 'finalizado') {
      return res.status(400).json({ error: 'No se pueden inscribir equipos en un torneo finalizado' });
    }

    if (req.usuario.rol === 'delegado') {
      const equipo = await Equipo.findById(equipo_id);
      if (!equipo || equipo.delegado_id.toString() !== req.usuario.id) {
        return res.status(403).json({ error: 'Solo puedes inscribir tu propio equipo' });
      }
    }

    const yaInscrito = torneo.equipos_inscritos.some(
      (e) => e.equipo_id.toString() === equipo_id && e.estado === 'inscrito'
    );
    if (yaInscrito) {
      return res.status(400).json({ error: 'Este equipo ya está inscrito en el torneo' });
    }

    torneo.equipos_inscritos.push({
      equipo_id,
      fecha_inscripcion: fecha_inscripcion || new Date(),
      firma,
      estado: 'inscrito',
    });

    await torneo.save();
    res.status(200).json(torneo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const obtenerTablaPosiciones = async (req, res) => {
  try {
    const { id } = req.params;
    const partidos = await Partido.find({ torneo_id: id, estado: 'finalizado' });

    const tabla = {};

    const inicializarEquipo = (equipoId) => {
      if (!tabla[equipoId]) {
        tabla[equipoId] = {
          equipo_id: equipoId,
          partidos_jugados: 0,
          ganados: 0,
          empatados: 0,
          perdidos: 0,
          goles_favor: 0,
          goles_contra: 0,
          diferencia_goles: 0,
          puntos: 0
        };
      }
    };

    partidos.forEach((partido) => {
      const localId = partido.equipo_local_id.toString();
      const visitanteId = partido.equipo_visitante_id.toString();

      inicializarEquipo(localId);
      inicializarEquipo(visitanteId);

      const golesLocal = partido.goles_local;
      const golesVisitante = partido.goles_visitante;

      tabla[localId].partidos_jugados++;
      tabla[visitanteId].partidos_jugados++;
      tabla[localId].goles_favor += golesLocal;
      tabla[localId].goles_contra += golesVisitante;
      tabla[visitanteId].goles_favor += golesVisitante;
      tabla[visitanteId].goles_contra += golesLocal;

      if (golesLocal > golesVisitante) {
        tabla[localId].ganados++;
        tabla[localId].puntos += 3;
        tabla[visitanteId].perdidos++;
      } else if (golesLocal < golesVisitante) {
        tabla[visitanteId].ganados++;
        tabla[visitanteId].puntos += 3;
        tabla[localId].perdidos++;
      } else {
        tabla[localId].empatados++;
        tabla[visitanteId].empatados++;
        tabla[localId].puntos += 1;
        tabla[visitanteId].puntos += 1;
      }
    });

    Object.values(tabla).forEach((eq) => {
      eq.diferencia_goles = eq.goles_favor - eq.goles_contra;
    });

    const equiposIds = Object.keys(tabla);
    const equipos = await Equipo.find({ _id: { $in: equiposIds } });

    const resultado = Object.values(tabla).map((eq) => {
      const info = equipos.find((e) => e._id.toString() === eq.equipo_id);
      return { ...eq, nombre_equipo: info ? info.nombre : 'Equipo no encontrado' };
    });

    resultado.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.diferencia_goles !== a.diferencia_goles) return b.diferencia_goles - a.diferencia_goles;
      return b.goles_favor - a.goles_favor;
    });

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const obtenerTablaTarjetas = async (req, res) => {
  try {
    const { id } = req.params;
    const partidos = await Partido.find({ torneo_id: id, estado: 'finalizado' });

    const tarjetas = {};

    partidos.forEach((partido) => {
      partido.estadisticas_jugadores.forEach((stat) => {
        if (stat.tarjetas_amarillas > 0 || stat.tarjetas_rojas > 0) {
          const jugadorId = stat.jugador_id.toString();
          const equipoId = stat.equipo_id.toString();

          if (!tarjetas[jugadorId]) {
            tarjetas[jugadorId] = {
              jugador_id: jugadorId,
              equipo_id: equipoId,
              tarjetas_amarillas: 0,
              tarjetas_rojas: 0,
            };
          }
          tarjetas[jugadorId].tarjetas_amarillas += stat.tarjetas_amarillas;
          tarjetas[jugadorId].tarjetas_rojas += stat.tarjetas_rojas;
        }
      });
    });

    const jugadorIds = Object.keys(tarjetas);
    const jugadores = await Jugador.find({ _id: { $in: jugadorIds } });
    const equipoIds = [...new Set(Object.values(tarjetas).map((t) => t.equipo_id))];
    const equipos = await Equipo.find({ _id: { $in: equipoIds } });

    const resultado = Object.values(tarjetas).map((t) => {
      const jugadorInfo = jugadores.find((j) => j._id.toString() === t.jugador_id);
      const equipoInfo = equipos.find((e) => e._id.toString() === t.equipo_id);
      return {
        ...t,
        nombre_jugador: jugadorInfo ? jugadorInfo.nombre : 'Jugador no encontrado',
        nombre_equipo: equipoInfo ? equipoInfo.nombre : 'Equipo no encontrado'
      };
    });

    resultado.sort((a, b) => (b.tarjetas_rojas - a.tarjetas_rojas) || (b.tarjetas_amarillas - a.tarjetas_amarillas));

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerTablaGoleadores = async (req, res) => {
  try {
    const { id } = req.params;
    const partidos = await Partido.find({ torneo_id: id, estado: 'finalizado' });

    const goleadores = {};

    partidos.forEach((partido) => {
      partido.estadisticas_jugadores.forEach((stat) => {
        if (stat.goles > 0) {
          const jugadorId = stat.jugador_id.toString();
          const equipoId = stat.equipo_id.toString();

          if (!goleadores[jugadorId]) {
            goleadores[jugadorId] = {
              jugador_id: jugadorId,
              equipo_id: equipoId,
              goles: 0
            };
          }
          goleadores[jugadorId].goles += stat.goles;
        }
      });
    });

    const jugadorIds = Object.keys(goleadores);
    const jugadores = await Jugador.find({ _id: { $in: jugadorIds } });
    const equipoIds = [...new Set(Object.values(goleadores).map((g) => g.equipo_id))];
    const equipos = await Equipo.find({ _id: { $in: equipoIds } });

    const resultado = Object.values(goleadores).map((g) => {
      const jugadorInfo = jugadores.find((j) => j._id.toString() === g.jugador_id);
      const equipoInfo = equipos.find((e) => e._id.toString() === g.equipo_id);
      return {
        ...g,
        nombre_jugador: jugadorInfo ? jugadorInfo.nombre : 'Jugador no encontrado',
        nombre_equipo: equipoInfo ? equipoInfo.nombre : 'Equipo no encontrado'
      };
    });

    resultado.sort((a, b) => b.goles - a.goles);

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearTorneo,
  listarTorneos,
  obtenerTorneo,
  actualizarTorneo,
  eliminarTorneo,
  obtenerTablaPosiciones,
  obtenerTablaGoleadores,
  obtenerTablaTarjetas,
  inscribirEquipo

};

