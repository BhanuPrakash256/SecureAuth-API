const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {revokeTokens} = require('../controllers/tokenController');
const authenticateToken = require('../middleware/authenticateToken');


router.post('/login', authController.login);
router.post('/logout', authenticateToken('refresh'), revokeTokens);

module.exports = router;