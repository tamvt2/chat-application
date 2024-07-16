const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');

router.get('/register', UserController.create);
router.get('/login', UserController.show);
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/logout', UserController.logout);
router.post('/update', UserController.update);
router.post('/searchUser', UserController.searchUserByPhone);

module.exports = router;
