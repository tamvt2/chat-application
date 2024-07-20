const express = require('express');
const router = express.Router();
const HomeController = require('../app/controllers/HomeController');

router.post('/add-new-user', HomeController.addNewUser);
router.post('/add-user', HomeController.addUser);
router.get('/get-user', HomeController.getUser);
router.post('/send-message', HomeController.sendMessage);
router.get('/get-message', HomeController.getMessage);
router.delete('/destroy-message/:id', HomeController.destroyMessage);
router.get('/get-image', HomeController.getImage);
router.get('/get-file', HomeController.getFile);
router.get('/get-channels', HomeController.getChannel);
router.get('/', HomeController.index);

module.exports = router;
