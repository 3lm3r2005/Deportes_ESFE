const express = require('express');
const router = express.Router();
const {
  crearConvocatoria,
  listarConvocatorias,
  obtenerConvocatoria,
  actualizarConvocatoria,
  eliminarConvocatoria
} = require('../controllers/ConvocatoriaController');

router.post('/', crearConvocatoria);
router.get('/', listarConvocatorias);
router.get('/:id', obtenerConvocatoria);
router.put('/:id', actualizarConvocatoria);
router.delete('/:id', eliminarConvocatoria);

module.exports = router;