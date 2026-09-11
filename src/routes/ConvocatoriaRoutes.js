const express = require('express');
const router = express.Router();
const {
  crearConvocatoria,
  listarConvocatorias,
  obtenerConvocatoria,
  actualizarConvocatoria,
  eliminarConvocatoria
} = require('../controllers/convocatoriaController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('admin'), crearConvocatoria);
router.get('/', verificarToken, listarConvocatorias);
router.get('/:id', verificarToken, obtenerConvocatoria);
router.put('/:id', verificarToken, verificarRol('admin'), actualizarConvocatoria);
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarConvocatoria);

module.exports = router;