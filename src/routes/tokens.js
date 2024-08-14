const express = require('express');
const router = express.Router();
const {issueTokens, revokeTokens} = require('../controllers/tokenController');


router.post('/issue-tokens', issueTokens);
router.post('/revoke-tokens', revokeTokens);

module.exports = router;