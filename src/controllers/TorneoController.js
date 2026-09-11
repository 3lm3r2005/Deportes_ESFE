const Torneo = require('../models/Torneo');
const Partido = require('../models/Partido');
const Equipo = require('../models/Equipo');

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

;module.exports = {
  crearTorneo,
  listarTorneos,
  obtenerTorneo,
  actualizarTorneo,
  eliminarTorneo,
  obtenerTablaPosiciones
};