const express = require('express');
const router = express.Router();
const {
  crearPartido,
  listarPartidos,
  obtenerPartido,
  actualizarPartido,
  eliminarPartido
} = require('../controllers/partidoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('admin'), crearPartido);
router.get('/', verificarToken, listarPartidos);
router.get('/:id', verificarToken, obtenerPartido);
router.put('/:id', verificarToken, verificarRol('admin', 'arbitro'), actualizarPartido);
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarPartido);

module.exports = router;