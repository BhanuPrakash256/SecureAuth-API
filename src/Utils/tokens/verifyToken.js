const jwt = require('jsonwebtoken');
const { AuthenticationError, TokenExpiredError } = require('../errors/AuthenticationError');

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Token has expired!');
    }
    throw new AuthenticationError('Token is Invalid.');
  }
};

module.exports = verifyToken;
