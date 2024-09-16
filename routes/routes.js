const express = require('express');
const router = express.Router();
const controller = require('../controller/controller')

router.get('/', controller.getHome);

router.post('/submitCode', controller.postCode);

module.exports = router;