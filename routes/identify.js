const express = require('express');
const { identifyHandler } = require('../controllers/identifyController');
const { validateIdentify } = require('../middleware/validateIdentify');

const router = express.Router();

router.post('/identify', validateIdentify, identifyHandler);

module.exports = router;
