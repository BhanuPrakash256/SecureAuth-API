// src/routes/api.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define your API routes here

// Route for creating a new user for identity verification
router.post('/', userController.createUser);

// Route for retrieving user information by username
router.get('/:username', userController.getUserByUsername);

// Route for updating a user 
router.put('/:username', userController.updateUser);

// Route for deleting a user by username
router.delete('/:username', userController.deleteUser);

// Route for verifying email
router.post('/verify-email/:username', userController.verifyEmail);

module.exports = router;
