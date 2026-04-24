const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { sensitiveLimiter } = require('../middleware/rateLimiter');
const idempotency = require('../middleware/idempotency');

router.post('/forgot-password', sensitiveLimiter, idempotency, passwordController.forgotPassword);
router.post('/reset-password/:token', passwordController.resetPassword);

module.exports = router;
