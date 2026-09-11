const express = require('express');
const router = express.Router();
const {
  crearJugador,
  listarJugadores,
  obtenerJugador,
  actualizarJugador,
  eliminarJugador
} = require('../controllers/jugadorController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('admin', 'delegado'), crearJugador);
router.get('/', verificarToken, listarJugadores);
router.get('/:id', verificarToken, obtenerJugador);
router.put('/:id', verificarToken, verificarRol('admin', 'delegado'), actualizarJugador);
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarJugador);

module.exports = router;