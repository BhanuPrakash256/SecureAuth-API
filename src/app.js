// src/app.js

require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/api');
const authenticateJWT = require('./middleware/auth0');


const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('tiny'));


// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB ✔️');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});


// Define your API routes here
app.use('/api/users', users);
app.use('/api/users/:username', authenticateJWT); // Use authentication middleware for all /api routes


module.exports = app