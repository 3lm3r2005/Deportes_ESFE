const express = require('express');
const router = express.Router();
const {
  crearEquipo,
  listarEquipos,
  obtenerEquipo,
  actualizarEquipo,
  eliminarEquipo
} = require('../controllers/equipoController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('admin', 'delegado'), crearEquipo);
router.get('/', verificarToken, listarEquipos);
router.get('/:id', verificarToken, obtenerEquipo);
router.put('/:id', verificarToken, verificarRol('admin', 'delegado'), actualizarEquipo);
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarEquipo);

module.exports = router;