const jwt = require('jsonwebtoken');
const { AuthenticationError, TokenExpiredError } = require('../errors/AuthenticationError');

const decodeToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Token has expired. Please log in again.');
    }
    throw new AuthenticationError('Unauthorized - Invalid token');
  }
};

module.exports = decodeToken;