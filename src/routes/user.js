const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');

router.get('/register', UserController.create);
router.get('/login', UserController.show);
router.post('/register', UserController.register);
router.post('/login', UserController.login);

module.exports = router;
