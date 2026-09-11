const express = require('express');
const router = express.Router();
const {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('admin'), crearUsuario);
router.get('/', verificarToken, verificarRol('admin'), listarUsuarios);
router.get('/:id', verificarToken, verificarRol('admin'), obtenerUsuario);
router.put('/:id', verificarToken, verificarRol('admin'), actualizarUsuario);
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarUsuario);

module.exports = router;