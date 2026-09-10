const express = require('express');
const router = express.Router();
const {
  crearJugador,
  listarJugadores,
  obtenerJugador,
  actualizarJugador,
  eliminarJugador
} = require('../controllers/jugadorController');

router.post('/', crearJugador);
router.get('/', listarJugadores);
router.get('/:id', obtenerJugador);
router.put('/:id', actualizarJugador);
router.delete('/:id', eliminarJugador);

module.exports = router;