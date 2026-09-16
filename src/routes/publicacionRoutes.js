const express = require('express');
const router = express.Router();
const {
  crearPublicacion,
  listarPublicaciones,
  actualizarPublicacion,
  eliminarPublicacion
} = require('../controllers/publicacionController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('admin'), crearPublicacion);
router.get('/', verificarToken, listarPublicaciones);
router.put('/:id', verificarToken, verificarRol('admin'), actualizarPublicacion);
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarPublicacion);

module.exports = router;