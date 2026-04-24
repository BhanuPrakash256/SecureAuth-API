const rateLimit = require('express-rate-limit');

const skipInTest = () => process.env.NODE_ENV === 'test';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: 'Too many requests, please try again later.' },
});

// Stricter limit for authentication endpoints (login, register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

// For high-value single-use operations (password reset, verification codes)
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: 'Too many requests for this operation, please try again in an hour.' },
});

module.exports = { globalLimiter, authLimiter, sensitiveLimiter };
