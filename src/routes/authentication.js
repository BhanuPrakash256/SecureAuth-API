const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { revokeTokens } = require('../controllers/tokenController');
const authenticateToken = require('../middleware/authenticateToken');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginValidators } = require('../middleware/validators/authValidators');
const handleValidation = require('../middleware/validators/handleValidation');

router.post('/login', authLimiter, loginValidators, handleValidation, authController.login);
router.post('/logout', authenticateToken('refresh'), revokeTokens);

module.exports = router;
