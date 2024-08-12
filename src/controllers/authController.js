// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createAccessToken, createRefreshToken, revokeTokens } = require('./tokenController');


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password!' });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // You might want to store the refreshToken in a database or a cache
    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error });
  }
};
