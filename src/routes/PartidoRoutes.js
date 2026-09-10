const express = require('express');
const router = express.Router();
const {
  crearPartido,
  listarPartidos,
  obtenerPartido,
  actualizarPartido,
  eliminarPartido
} = require('../controllers/partidoController');

router.post('/', crearPartido);
router.get('/', listarPartidos);
router.get('/:id', obtenerPartido);
router.put('/:id', actualizarPartido);
router.delete('/:id', eliminarPartido);

module.exports = router;