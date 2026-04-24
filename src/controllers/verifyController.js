const User = require('../models/User');
const { VerificationError } = require('../Utils/errors/BadRequestError');
const NotFoundError = require('../Utils/errors/NotFoundError');

exports.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new VerificationError('Verification code has expired');
    }

    if (user.emailVerificationCode !== code) {
      throw new VerificationError('Invalid verification code');
    }

    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();
    res.status(200).json({ message: 'Email verified successfully' });

  } catch (error) {
    next(error);
  }
};

exports.verifyPhoneNumber = async (req, res, next) => {
  try {
    const { code } = req.body;
    const { username } = req.params;
    const user = await User.findOne({ username, phoneVerificationCode: code });

    if (!user) {
      throw new VerificationError('Invalid verification code');
    }

    if (user.phoneVerificationExpires && user.phoneVerificationExpires < new Date()) {
      throw new VerificationError('Verification code has expired');
    }

    user.phoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;

    await user.save();
    res.status(200).json({ message: 'Phone number verified successfully' });

  } catch (error) {
    next(error);
  }
};

exports.updateVerificationStatus = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.emailVerified && user.phoneVerified) {
      user.verificationStatus = 'verified';
      await user.save();
      return res.status(200).json({ message: 'User verified successfully. Now, Login with your credentials' });
    }

    res.status(400).json({ message: 'Email and phone number verification required' });
  } catch (error) {
    next(error);
  }
};
