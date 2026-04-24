const express = require('express');
const router = express.Router();
const { issueTokens, revokeTokens } = require('../controllers/tokenController');
const authenticateToken = require('../middleware/authenticateToken');
const idempotency = require('../middleware/idempotency');

router.post('/issue-tokens', authenticateToken('refresh'), idempotency, issueTokens);
router.post('/revoke-tokens', authenticateToken('refresh'), revokeTokens);

module.exports = router;
