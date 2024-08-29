const User = require('../models/User');
const { createAccessToken, createRefreshToken } = require('../Utils/tokens/createTokens');
const AuthenticationError = require('../Utils/errors/AuthenticationError');
const NotFoundError = require('../Utils/errors/NotFoundError');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if(!user) {
        throw new NotFoundError('User Not Found');
    }

    if (!(await user.comparePassword(password))){
      throw new AuthenticationError('Unauthorized - Wrong password!');
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return res.status(200).json({ accessToken, refreshToken });
    
  } catch (error) {
    next(error);
  }
};
