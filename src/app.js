require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const { UserRoute, PasswordRoute, TokenRoute, VerifyRoute, AuthRoute } = require('./routes/index');
const healthRoute = require('./routes/health');
const errorHandler = require('./middleware/error');
const versionMiddleware = require('./middleware/version');
const { globalLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('tiny'));

mongoose
  .connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => logger.error('MongoDB initial connection failed', { err }));

mongoose.connection.on('connected', () => logger.info('Connected to MongoDB'));
mongoose.connection.on('error', (err) => logger.error('MongoDB connection error', { err }));

// Health check — no rate limit, no version prefix
app.use('/health', healthRoute);

// Versioned API — all user-facing routes live here
app.use('/api/v1', versionMiddleware, globalLimiter);
app.use('/api/v1/users', UserRoute);
app.use('/api/v1/users', AuthRoute);
app.use('/api/v1/users', VerifyRoute);
app.use('/api/v1/users', TokenRoute);
app.use('/api/v1/users', PasswordRoute);

app.use(errorHandler);

module.exports = app;
