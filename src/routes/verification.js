const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');


router.post('/verify-email/:username', verifyController.verifyEmail);
router.post('/verify-phone/:username', verifyController.verifyPhoneNumber);
router.get('/verify-status/:username', verifyController.updateVerificationStatus);

module.exports = router;