const express = require('express');
const router = express.Router();
const { registrar, login, logout } = require('../controllers/authController');

router.post('/logout', logout);
router.post('/registro', registrar);
router.post('/login', login);

module.exports = router;