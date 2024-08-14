
require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/users');
const auth = require('./routes/authentication');
const tokens = require('./routes/tokens');
const verify = require('./routes/verification');


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


app.use('/api/users', users);
app.use('/api/users', auth);
app.use('/api/users', verify);
app.use('/api/users', tokens);


module.exports = app