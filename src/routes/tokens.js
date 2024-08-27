const express = require('express');
const router = express.Router();
const {issueTokens, revokeTokens} = require('../controllers/tokenController');
const authenticateToken = require('../middleware/authenticateToken');


router.post('/issue-tokens', authenticateToken('refresh'), issueTokens);
router.post('/revoke-tokens', authenticateToken('refresh'), revokeTokens);

module.exports = router;