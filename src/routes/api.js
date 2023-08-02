// src/routes/api.js

const express = require('express');
const router = express.Router();

// Define your API routes here
const userController = require('../controllers/userController');

// Route for creating a new user for identity verification
router.post('/api/users', userController.createUser);


module.exports = router;
