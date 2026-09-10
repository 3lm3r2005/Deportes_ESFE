const express = require('express');
const router = express.Router();
const {
  crearEquipo,
  listarEquipos,
  obtenerEquipo,
  actualizarEquipo,
  eliminarEquipo
} = require('../controllers/equipoController');

router.post('/', crearEquipo);
router.get('/', listarEquipos);
router.get('/:id', obtenerEquipo);
router.put('/:id', actualizarEquipo);
router.delete('/:id', eliminarEquipo);

module.exports = router;