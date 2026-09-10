const express = require('express');
const router = express.Router();
const {
  crearTorneo,
  listarTorneos,
  obtenerTorneo,
  actualizarTorneo,
  eliminarTorneo
} = require('../controllers/torneoController');

router.post('/', crearTorneo);
router.get('/', listarTorneos);
router.get('/:id', obtenerTorneo);
router.put('/:id', actualizarTorneo);
router.delete('/:id', eliminarTorneo);

module.exports = router;