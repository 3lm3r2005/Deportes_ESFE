const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/authController');

// El registro público está deshabilitado: admin, arbitro y delegado se crean
// solo desde el panel interno por un admin.
// router.post('/registro', registrar);

router.post('/login', login);

module.exports = router;