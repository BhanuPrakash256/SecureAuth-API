const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {revokeTokens} = require('../controllers/tokenController');


router.post('/login', authController.login);
router.post('/logout', revokeTokens);

module.exports = router;