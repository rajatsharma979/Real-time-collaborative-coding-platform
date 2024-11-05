const express = require('express');
const router = express.Router();
const controller = require('../controller/controller')

router.get('/', controller.getHome);

router.post('/submitCode', controller.postCode);

router.post('/getCollab', controller.getCollabFields);

router.post('/createRoom', controller.createRoom);

router.post('/joinRoom', controller.joinRoom);

module.exports = router;