const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

router.post('/verify-email/:username', sensitiveLimiter, verifyController.verifyEmail);
router.post('/verify-phone/:username', sensitiveLimiter, verifyController.verifyPhoneNumber);
router.get('/verify-status/:username', verifyController.updateVerificationStatus);

module.exports = router;
