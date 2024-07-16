const express = require('express');
const router = express.Router();
const HomeControler = require('../app/controllers/HomeController');

router.post('/add-new-user', HomeControler.addNewUser);
router.post('/add-user', HomeControler.addUser);
router.get('/get-user', HomeControler.getUser);
router.get('/', HomeControler.index);
router.post('/send-message', HomeControler.sendMessage);
router.get('/get-message', HomeControler.getMessage);

module.exports = router;
