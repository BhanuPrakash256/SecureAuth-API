const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authAccess = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const {username} = req.params;
  
  if(authHeader)
  {
      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findOne({ username });

        if (!user) {
          return res.status(401).json({ message: 'User not found.' });
        }

        if (decoded.token_type !== 'access') {
            return res.status(403).json({ message: 'Invalid token type' });
        }

        // Check if the token version matches
        if (decoded.tokenVersion !== user.tokenVersion) {
          return res.status(401).json({ message: 'Token is no longer valid.' });
        }

        req.user = user;
        next();

      } catch (error) {
        if (error.name === "TokenExpiredError" )
        {
          return res.status(401).json({ message: 'Token has expired!' });
        }
        
        return res.status(401).json({ message: 'Token is Invalid.' }); 
      }
  }
  else 
  {
    res.status(401).json({message: 'Unauthorized - No token provided!'});
  }
};

module.exports = authAccess;