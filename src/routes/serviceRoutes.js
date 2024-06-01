const express = require('express');
const { registerService } = require('../controllers/serviceController');

const router = express.Router();

router.post('/register', registerService);

module.exports = router;