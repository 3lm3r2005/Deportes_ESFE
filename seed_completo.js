const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const Usuario = require('./src/models/Usuario');
const Equipo = require('./src/models/Equipo');
const Jugador = require('./src/models/Jugador');
const Torneo = require('./src/models/Torneo');
const Partido = require('./src/models/Partido');
const Convocatoria = require('./src/models/Convocatoria');

const poblarDatos = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('Error: No se encontró la variable MONGODB_URI');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log(' Conectado a MongoDB...');

    // 1. Verificar y proteger a los administradores
    const admins = await Usuario.find({ rol: 'admin' });
    console.log(`\n Protegiendo administradores encontrados (${admins.length}):`);
    admins.forEach((a) => console.log(`   - ${a.nombre} ${a.apellido} (${a.email}) [ID: ${a._id}]`));

    if (admins.length === 0) {
      console.log(' Advertencia: No se encontró ningún admin. Creando admin de respaldo...');
      const adminDefault = new Usuario({
        nombre: 'Admin',
        apellido: 'ESFE',
        email: 'admin@esfe.edu.sv',
        password: 'password123',
        rol: 'admin',
        estado: 'activo',
      });
      await adminDefault.save();
      admins.push(adminDefault);
    }

    // 2. Limpieza de datos antiguos (NUNCA BORRA ADMINS)
    console.log('\n🧹 Limpiando datos antiguos...');
    const delUsuarios = await Usuario.deleteMany({ rol: { $ne: 'admin' } });
    console.log(`   - Usuarios eliminados (no admins): ${delUsuarios.deletedCount}`);

    const delEquipos = await Equipo.deleteMany({});
    console.log(`   - Equipos eliminados: ${delEquipos.deletedCount}`);

    const delJugadores = await Jugador.deleteMany({});
    console.log(`   - Jugadores eliminados: ${delJugadores.deletedCount}`);

    const delTorneos = await Torneo.deleteMany({});
    console.log(`   - Torneos eliminados: ${delTorneos.deletedCount}`);

    const delPartidos = await Partido.deleteMany({});
    console.log(`   - Partidos eliminados: ${delPartidos.deletedCount}`);

    const delConvocatorias = await Convocatoria.deleteMany({});
    console.log(`   - Convocatorias eliminadas: ${delConvocatorias.deletedCount}`);

    // 3. Crear 4 Delegados y 2 Árbitros
    console.log('\n Creando Delegados y Árbitros...');
    const delegadosData = [
      {
        nombre: 'Carlos',
        apellido: 'Mendoza',
        email: 'delegado.software@esfe.edu.sv',
        password: 'delegado123',
        rol: 'delegado',
        estado: 'activo',
      },
      {
        nombre: 'Sofia',
        apellido: 'Rivera',
        email: 'delegado.electrica@esfe.edu.sv',
        password: 'delegado123',
        rol: 'delegado',
        estado: 'activo',
      },
      {
        nombre: 'Mario',
        apellido: 'Alvarado',
        email: 'delegado.mercadeo@esfe.edu.sv',
        password: 'delegado123',
        rol: 'delegado',
        estado: 'activo',
      },
      {
        nombre: 'Gabriela',
        apellido: 'Cruz',
        email: 'delegado.turismo@esfe.edu.sv',
        password: 'delegado123',
        rol: 'delegado',
        estado: 'activo',
      },
    ];

    const delegados = [];
    for (const d of delegadosData) {
      const u = new Usuario(d);
      await u.save();
      delegados.push(u);
    }
    console.log(`    ${delegados.length} Delegados creados.`);

    const arbitrosData = [
      {
        nombre: 'Roberto',
        apellido: 'Escobar',
        email: 'arbitro.escobar@esfe.edu.sv',
        password: 'arbitro123',
        rol: 'arbitro',
        estado: 'activo',
      },
      {
        nombre: 'Luis',
        apellido: 'Hernandez',
        email: 'arbitro.hernandez@esfe.edu.sv',
        password: 'arbitro123',
        rol: 'arbitro',
        estado: 'activo',
      },
    ];

    const arbitros = [];
    for (const a of arbitrosData) {
      const u = new Usuario(a);
      await u.save();
      arbitros.push(u);
    }
    console.log(`    ${arbitros.length} Árbitros creados.`);

    // 4. Crear los 4 Equipos
    console.log('\n Creando 4 Equipos de las carreras de ESFE...');
    const equiposConfig = [
      {
        nombre: 'Ingeniería de Software FC',
        carrera: 'Técnico en Desarrollo de Software',
        anio: 2026,
        delegado_id: delegados[0]._id,
        logo_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80',
      },
      {
        nombre: 'Electro Fuerza FC',
        carrera: 'Técnico en Ingeniería Eléctrica',
        anio: 2026,
        delegado_id: delegados[1]._id,
        logo_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=80',
      },
      {
        nombre: 'Mercadotecnia United',
        carrera: 'Técnico en Mercadeo',
        anio: 2026,
        delegado_id: delegados[2]._id,
        logo_url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=150&auto=format&fit=crop&q=80',
      },
      {
        nombre: 'Turismo Aventureros FC',
        carrera: 'Técnico en Turismo',
        anio: 2026,
        delegado_id: delegados[3]._id,
        logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
      },
    ];

    // Nombres y posiciones de fútbol 5 para los 8 jugadores por equipo
    const plantillasBase = [
      // Equipo 1: Software FC
      [
        { nombre: 'Kevin', apellido: 'Portillo', carne: 'PO26001', pos: 'Portero', dorsal: 1 },
        { nombre: 'Alexander', apellido: 'Gomez', carne: 'PO26002', pos: 'Defensa', dorsal: 2 },
        { nombre: 'Rodrigo', apellido: 'Santos', carne: 'PO26003', pos: 'Defensa', dorsal: 3 },
        { nombre: 'Bryan', apellido: 'Mejia', carne: 'PO26004', pos: 'Mediocampista', dorsal: 4 },
        { nombre: 'Diego', apellido: 'Hernandez', carne: 'PO26005', pos: 'Delantero', dorsal: 5 },
        { nombre: 'Fernando', apellido: 'Lopez', carne: 'PO26006', pos: 'Defensa', dorsal: 6 },
        { nombre: 'Eduardo', apellido: 'Castillo', carne: 'PO26007', pos: 'Mediocampista', dorsal: 7 },
        { nombre: 'Christian', apellido: 'Rivas', carne: 'PO26008', pos: 'Delantero', dorsal: 8 },
      ],
      // Equipo 2: Eléctrica
      [
        { nombre: 'Jose', apellido: 'Navarro', carne: 'PO26009', pos: 'Portero', dorsal: 1 },
        { nombre: 'Oscar', apellido: 'Fuentes', carne: 'PO26010', pos: 'Defensa', dorsal: 2 },
        { nombre: 'Manuel', apellido: 'Vasquez', carne: 'PO26011', pos: 'Defensa', dorsal: 3 },
        { nombre: 'Ricardo', apellido: 'Aguilar', carne: 'PO26012', pos: 'Mediocampista', dorsal: 4 },
        { nombre: 'Hector', apellido: 'Reyes', carne: 'PO26013', pos: 'Delantero', dorsal: 5 },
        { nombre: 'Samuel', apellido: 'Zelaya', carne: 'PO26014', pos: 'Defensa', dorsal: 6 },
        { nombre: 'Guillermo', apellido: 'Orellana', carne: 'PO26015', pos: 'Mediocampista', dorsal: 7 },
        { nombre: 'Victor', apellido: 'Pineda', carne: 'PO26016', pos: 'Delantero', dorsal: 8 },
      ],
      // Equipo 3: Mercadeo
      [
        { nombre: 'Daniel', apellido: 'Flores', carne: 'PO26017', pos: 'Portero', dorsal: 1 },
        { nombre: 'Jorge', apellido: 'Cortez', carne: 'PO26018', pos: 'Defensa', dorsal: 2 },
        { nombre: 'Andres', apellido: 'Morales', carne: 'PO26019', pos: 'Defensa', dorsal: 3 },
        { nombre: 'Gabriel', apellido: 'Palacios', carne: 'PO26020', pos: 'Mediocampista', dorsal: 4 },
        { nombre: 'Jonathan', apellido: 'Benitez', carne: 'PO26021', pos: 'Delantero', dorsal: 5 },
        { nombre: 'Raul', apellido: 'Salazar', carne: 'PO26022', pos: 'Defensa', dorsal: 6 },
        { nombre: 'Wilfredo', apellido: 'Castro', carne: 'PO26023', pos: 'Mediocampista', dorsal: 7 },
        { nombre: 'Marcos', apellido: 'Guzman', carne: 'PO26024', pos: 'Delantero', dorsal: 8 },
      ],
      // Equipo 4: Turismo
      [
        { nombre: 'Emilio', apellido: 'Serrano', carne: 'PO26025', pos: 'Portero', dorsal: 1 },
        { nombre: 'Cesar', apellido: 'Perez', carne: 'PO26026', pos: 'Defensa', dorsal: 2 },
        { nombre: 'Hugo', apellido: 'Torres', carne: 'PO26027', pos: 'Defensa', dorsal: 3 },
        { nombre: 'Javier', apellido: 'Miranda', carne: 'PO26028', pos: 'Mediocampista', dorsal: 4 },
        { nombre: 'Nelson', apellido: 'Escobar', carne: 'PO26029', pos: 'Delantero', dorsal: 5 },
        { nombre: 'Rene', apellido: 'Chavez', carne: 'PO26030', pos: 'Defensa', dorsal: 6 },
        { nombre: 'Mauricio', apellido: 'Alfaro', carne: 'PO26031', pos: 'Mediocampista', dorsal: 7 },
        { nombre: 'Walter', apellido: 'Ramirez', carne: 'PO26032', pos: 'Delantero', dorsal: 8 },
      ],
    ];

    const equiposGuardados = [];
    const todosLosJugadores = [];

    for (let i = 0; i < equiposConfig.length; i++) {
      const eqConf = equiposConfig[i];
      const jugadoresEquipo = plantillasBase[i];

      const jugadoresInscritosEquipo = [];

      for (let j = 0; j < jugadoresEquipo.length; j++) {
        const jInfo = jugadoresEquipo[j];
        const nuevoJugador = new Jugador({
          nombre: jInfo.nombre,
          apellido: jInfo.apellido,
          carne: jInfo.carne,
          telefono: '7' + Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7),
          posicion: jInfo.pos,
          estado: 'activo',
        });
        await nuevoJugador.save();
        todosLosJugadores.push(nuevoJugador);

        jugadoresInscritosEquipo.push({
          jugador_id: nuevoJugador._id,
          dorsal: jInfo.dorsal,
          estado: j < 5 ? 'titular' : 'reserva',
          fecha_alta: new Date('2026-02-20'),
        });
      }

      const nuevoEquipo = new Equipo({
        ...eqConf,
        jugadores_inscritos: jugadoresInscritosEquipo,
      });
      await nuevoEquipo.save();
      equiposGuardados.push(nuevoEquipo);
    }
    console.log(`    4 Equipos y 32 Jugadores creados con éxito.`);

    // 5. Crear 2 Torneos
    console.log('\n Creando Torneos e inscribiendo equipos...');
    const torneoIntercarreras = new Torneo({
      nombre: 'Torneo Intercarreras ESFE 2026',
      anio: 2026,
      fecha_inicio: new Date('2026-03-01'),
      fecha_fin: new Date('2026-05-30'),
      estado: 'activo',
      equipos_inscritos: equiposGuardados.map((eq) => ({
        equipo_id: eq._id,
        fecha_inscripcion: new Date('2026-02-25'),
        firma: 'Confirmado por Delegado',
        estado: 'inscrito',
      })),
    });
    await torneoIntercarreras.save();

    const copaRelampago = new Torneo({
      nombre: 'Copa Relámpago ESFE 2026',
      anio: 2026,
      fecha_inicio: new Date('2026-06-01'),
      fecha_fin: new Date('2026-06-20'),
      estado: 'planificado',
      equipos_inscritos: equiposGuardados.map((eq) => ({
        equipo_id: eq._id,
        fecha_inscripcion: new Date('2026-03-01'),
        firma: 'Pre-inscrito',
        estado: 'inscrito',
      })),
    });
    await copaRelampago.save();
    console.log('    2 Torneos creados con los 4 equipos inscritos.');

    // 6. Crear Partidos (2 Finalizados para generar tabla de posiciones y 2 Programados)
    console.log('\n⚽ Creando Partidos...');
    const eqSoftware = equiposGuardados[0];
    const eqElectrica = equiposGuardados[1];
    const eqMercadeo = equiposGuardados[2];
    const eqTurismo = equiposGuardados[3];

    // Partido 1: Software 3 - 1 Eléctrica (Finalizado)
    const p1JugadorSoftwareGoleador = eqSoftware.jugadores_inscritos[4].jugador_id; // Diego Hernández
    const p1JugadorSoftwareGoleador2 = eqSoftware.jugadores_inscritos[3].jugador_id; // Bryan Mejía
    const p1JugadorElectricaGoleador = eqElectrica.jugadores_inscritos[4].jugador_id; // Héctor Reyes

    const partido1 = new Partido({
      torneo_id: torneoIntercarreras._id,
      equipo_local_id: eqSoftware._id,
      equipo_visitante_id: eqElectrica._id,
      arbitro_id: arbitros[0]._id,
      fecha: new Date('2026-03-10'),
      hora: '10:00',
      estado: 'finalizado',
      goles_local: 3,
      goles_visitante: 1,
      estadisticas_jugadores: [
        {
          jugador_id: p1JugadorSoftwareGoleador,
          equipo_id: eqSoftware._id,
          titular: true,
          goles: 2,
          tarjetas_amarillas: 0,
          tarjetas_rojas: 0,
        },
        {
          jugador_id: p1JugadorSoftwareGoleador2,
          equipo_id: eqSoftware._id,
          titular: true,
          goles: 1,
          tarjetas_amarillas: 1,
          tarjetas_rojas: 0,
        },
        {
          jugador_id: p1JugadorElectricaGoleador,
          equipo_id: eqElectrica._id,
          titular: true,
          goles: 1,
          tarjetas_amarillas: 1,
          tarjetas_rojas: 0,
        },
      ],
    });
    await partido1.save();

    // Partido 2: Mercadeo 2 - 2 Turismo (Finalizado)
    const p2GoleadorMercadeo = eqMercadeo.jugadores_inscritos[4].jugador_id;
    const p2GoleadorTurismo1 = eqTurismo.jugadores_inscritos[4].jugador_id;
    const p2GoleadorTurismo2 = eqTurismo.jugadores_inscritos[3].jugador_id;

    const partido2 = new Partido({
      torneo_id: torneoIntercarreras._id,
      equipo_local_id: eqMercadeo._id,
      equipo_visitante_id: eqTurismo._id,
      arbitro_id: arbitros[1]._id,
      fecha: new Date('2026-03-12'),
      hora: '14:30',
      estado: 'finalizado',
      goles_local: 2,
      goles_visitante: 2,
      estadisticas_jugadores: [
        {
          jugador_id: p2GoleadorMercadeo,
          equipo_id: eqMercadeo._id,
          titular: true,
          goles: 2,
          tarjetas_amarillas: 0,
          tarjetas_rojas: 0,
        },
        {
          jugador_id: p2GoleadorTurismo1,
          equipo_id: eqTurismo._id,
          titular: true,
          goles: 1,
          tarjetas_amarillas: 1,
          tarjetas_rojas: 0,
        },
        {
          jugador_id: p2GoleadorTurismo2,
          equipo_id: eqTurismo._id,
          titular: true,
          goles: 1,
          tarjetas_amarillas: 0,
          tarjetas_rojas: 0,
        },
      ],
    });
    await partido2.save();

    // Partido 3: Software vs Mercadeo (Programado para próximas fechas)
    const partido3 = new Partido({
      torneo_id: torneoIntercarreras._id,
      equipo_local_id: eqSoftware._id,
      equipo_visitante_id: eqMercadeo._id,
      arbitro_id: arbitros[0]._id,
      fecha: new Date('2026-04-05'),
      hora: '09:30',
      estado: 'programado',
      goles_local: 0,
      goles_visitante: 0,
    });
    await partido3.save();

    // Partido 4: Eléctrica vs Turismo (Programado)
    const partido4 = new Partido({
      torneo_id: torneoIntercarreras._id,
      equipo_local_id: eqElectrica._id,
      equipo_visitante_id: eqTurismo._id,
      arbitro_id: arbitros[1]._id,
      fecha: new Date('2026-04-06'),
      hora: '15:00',
      estado: 'programado',
      goles_local: 0,
      goles_visitante: 0,
    });
    await partido4.save();
    console.log('    4 Partidos creados (2 finalizados con estadísticas y 2 programados).');

    // 7. Crear Convocatorias
    console.log('\n📢 Creando Convocatorias...');
    const convocatoriasData = [
      {
        torneo_id: torneoIntercarreras._id,
        titulo: 'Convocatoria Oficial Torneo Intercarreras 2026',
        mensaje: 'Se invita a toda la comunidad estudiantil de ESFE a apoyar a sus selecciones en el Torneo Intercarreras 2026. Los partidos se disputarán en la cancha principal los fines de semana.',
        fecha_publicacion: new Date('2026-02-15'),
        fecha_limite: new Date('2026-02-28'),
        estado: 'cerrada',
      },
      {
        torneo_id: copaRelampago._id,
        titulo: 'Inscripciones Abiertas: Copa Relámpago ESFE 2026',
        mensaje: 'Abierto el período de confirmación de plantillas para la Copa Relámpago 2026. Los delegados deben verificar sus dorsales antes de la fecha límite estipulada.',
        fecha_publicacion: new Date('2026-03-01'),
        fecha_limite: new Date('2026-05-25'),
        estado: 'abierta',
      },
    ];

    for (const c of convocatoriasData) {
      const conv = new Convocatoria(c);
      await conv.save();
    }
    console.log('    2 Convocatorias creadas.');

    console.log('\n=============================================');
    console.log(' ¡CARGA DE DATOS COMPLETADA CON ÉXITO!');
    console.log('=============================================');
    console.log('\nCUENTAS CREADAS PARA PRUEBAS:');
    console.log('---------------------------------------------');
    console.log('ADMINISTRADORES PRESERVADOS:');
    admins.forEach((a) => console.log(`  • Email: ${a.email}`));
    console.log('\nDELEGADOS (Contraseña para todos: delegado123):');
    delegadosData.forEach((d) => console.log(`  • ${d.email} -> Equipo: ${d.nombre}`));
    console.log('\nÁRBITROS (Contraseña para todos: arbitro123):');
    arbitrosData.forEach((a) => console.log(`  • ${a.email}`));
    console.log('---------------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error(' Error en la carga de datos:', error);
    process.exit(1);
  }
};

poblarDatos();
