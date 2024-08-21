const express = require('express');
const router = express.Router();
const {issueTokens, revokeTokens} = require('../controllers/tokenController');
const authRefresh = require('../middleware/authenticate_RefreshToken');

router.post('/issue-tokens', authRefresh, issueTokens);
router.post('/revoke-tokens', authRefresh, revokeTokens);

module.exports = router;