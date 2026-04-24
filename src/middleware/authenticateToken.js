const validateUser = require('../Utils/users/validateUser');
const verifyToken = require('../Utils/tokens/verifyToken');

const authenticateToken = (tokenType) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized - No token provided!' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: `${tokenType === 'access' ? 'Access' : 'Refresh'} token is required`,
    });
  }

  try {
    const secret =
      tokenType === 'access'
        ? process.env.ACCESS_TOKEN_SECRET
        : process.env.REFRESH_TOKEN_SECRET;

    const decoded = verifyToken(token, secret);
    req.user = await validateUser(decoded, tokenType);
    next();

  } catch (error) {
    if (error.name === 'BadRequestError') {
      return res.status(403).json({ message: error.message });
    }
    // AuthenticationError, TokenExpiredError, NotFoundError → 401
    return res.status(401).json({ message: error.message });
  }
};

module.exports = authenticateToken;
