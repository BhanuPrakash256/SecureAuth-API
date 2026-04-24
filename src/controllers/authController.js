const User = require('../models/User');
const { createAccessToken, createRefreshToken } = require('../Utils/tokens/createTokens');
const { AuthenticationError } = require('../Utils/errors/AuthenticationError');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    // Return the same error for both "not found" and "wrong password" to prevent user enumeration
    const valid = user && (await user.comparePassword(password));
    if (!valid) {
      throw new AuthenticationError('Invalid credentials');
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return res.status(200).json({ accessToken, refreshToken });

  } catch (error) {
    next(error);
  }
};
