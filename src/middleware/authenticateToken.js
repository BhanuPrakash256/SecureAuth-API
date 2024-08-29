const validateUser = require('../Utils/users/validateUser');
const verifyToken = require('../Utils/tokens/verifyToken');
const { AuthenticationError } = require('../Utils/errors/AuthenticationError');

const authenticateToken = (tokenType) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthenticationError('Unauthorized - No authorization header provided!');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthenticationError(`Unauthorized - ${tokenType === 'access' ? 'Access' : 'Refresh'} token is required`);
    }

    const secret = tokenType === 'access' ? process.env.ACCESS_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET;
    const decoded = verifyToken(token, secret);

    req.user = await validateUser(decoded, tokenType);
    next();

  } catch (error) {
    next(error);
    console.log(error.name);
  }
};

module.exports = authenticateToken;
