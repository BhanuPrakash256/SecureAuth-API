const User = require('../../models/User');
const NotFoundError = require('../errors/NotFoundError');
const { BadRequestError } = require('../errors/BadRequestError');
const { AuthenticationError } = require('../errors/AuthenticationError');

const validateUser = async (decoded, tokenType) => {
  const user = await User.findById(decoded.id);

  if (!user) throw new NotFoundError('User not found.');
  if (decoded.token_type !== tokenType) throw new BadRequestError('Invalid token type');
  if (decoded.tokenVersion !== user.tokenVersion) throw new AuthenticationError('Token is no longer valid.');

  return user;
};

module.exports = validateUser;
