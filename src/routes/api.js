// src/routes/api.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyController = require('../controllers/verifyController');
const authController = require('../controllers/authController');
const {issueTokens, revokeTokens} = require('../controllers/tokenController');
const authenticateJWT = require('../middleware/auth0');

// Define your API routes here

// Route for creating a new user for identity verification
router.post('/', userController.createUser);

// Route for retrieving user information by username
router.get('/:username', authenticateJWT, userController.getUserByUsername);

// Route for updating a user 
router.put('/:username', authenticateJWT, userController.updateUser);

// Route for deleting a user by username
router.delete('/:username', authenticateJWT, userController.deleteUser);

// Route for verifying email
router.post('/verify-email/:username', verifyController.verifyEmail);

// Route for verifying phone number
router.post('/verify-phone/:username', verifyController.verifyPhoneNumber);

// Route for updating verification status
router.get('/verify-status/:username', verifyController.updateVerificationStatus);

// Route for Login
router.post('/login', authController.login);

// Route for Logout
router.post('/logout', revokeTokens);

// Route for issuing access and refresh tokens
router.post('/issue-tokens', issueTokens);

// Route for revoking access and refresh tokens
router.post('/revoke-tokens', revokeTokens);

module.exports = router;
