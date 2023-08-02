// src/app.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const userController = require('./controllers/userController'); // Import the userController

const app = express();
// const connectionString = 'mongodb://localhost:27017/identity_verification_db';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Define your API routes here
app.post('/api/users', userController.createUser); // Use the createUser controller function


module.exports = app