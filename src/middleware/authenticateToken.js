const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (tokenType) => async (req, res, next) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized - No token provided!' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: `${tokenType === 'access' ? 'Access' : 'Refresh'} token is required` });
  }

  try {
    const secret = tokenType === 'access' ? process.env.ACCESS_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET;
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (decoded.token_type !== tokenType) {
      return res.status(403).json({ message: 'Invalid token type' });
    }

    // Check if the token version matches
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Token is no longer valid.' });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: 'Token has expired!' });
    }
    
    return res.status(401).json({ message: 'Token is Invalid.' });
  }
};

module.exports = authenticateToken;
