
require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const { UserRoute, PasswordRoute, TokenRoute, VerifyRoute, AuthRoute } = require('./routes/index');
const logger = require('../src/Utils/logger');

const errorHandler = require('./middleware/error');


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
  logger.info('Connected to MongoDB ✔️✔️');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});


app.use('/api/users', UserRoute);
app.use('/api/users', AuthRoute);
app.use('/api/users', VerifyRoute);
app.use('/api/users', TokenRoute);
app.use('/api/users', PasswordRoute);

app.use(errorHandler);

module.exports = app