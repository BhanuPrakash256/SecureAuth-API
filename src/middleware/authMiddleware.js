// src/middleware/authMiddleware.js

const secretKey = 'avengers-assemble';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
};

module.exports = authenticate;
