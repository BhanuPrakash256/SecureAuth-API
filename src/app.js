// src/app.js

const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use('/api', require('./routes/api'));

module.exports = app;
