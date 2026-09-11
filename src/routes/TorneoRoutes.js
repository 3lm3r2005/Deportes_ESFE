const express = require('express');
const router = express.Router();
const {
  crearTorneo,
  listarTorneos,
  obtenerTorneo,
  actualizarTorneo,
  eliminarTorneo,
  obtenerTablaPosiciones
} = require('../controllers/torneoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('admin'), crearTorneo);
router.get('/', verificarToken, listarTorneos);
router.get('/:id', verificarToken, obtenerTorneo);
router.get('/:id/tabla-posiciones', verificarToken, obtenerTablaPosiciones);
router.put('/:id', verificarToken, verificarRol('admin'), actualizarTorneo);
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarTorneo);

module.exports = router;