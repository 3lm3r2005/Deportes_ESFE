require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./src/config/db');

const usuarioRoutes = require('./src/routes/UsuarioRoutes');
const torneoRoutes = require('./src/routes/TorneoRoutes');
const jugadorRoutes = require('./src/routes/JugadorRoutes');
const equipoRoutes = require('./src/routes/EquipoRoutes');
const partidoRoutes = require('./src/routes/PartidoRoutes');
const convocatoriaRoutes = require('./src/routes/ConvocatoriaRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

conectarDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Deportes ESFE funcionando' });
});

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/torneos', torneoRoutes);
app.use('/api/jugadores', jugadorRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/convocatorias', convocatoriaRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});