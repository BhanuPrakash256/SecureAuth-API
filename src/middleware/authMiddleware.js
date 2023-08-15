// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer','');

  if(!token)  
    return res.status(401).json({message: 'Unauthorized - No token provided'});

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err)
        return res.status(403).json({message: 'Forbidden - Invalid token'});
        
      req.user = user;
      next();
  });

};

module.exports = authenticateJWT;
