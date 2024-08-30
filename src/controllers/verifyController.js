const {User} = require('../models/User');
const { VerificationError } = require('../Utils/errors/BadRequestError');
const NotFoundError = require('../Utils/errors/NotFoundError');

// Function to verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { username, code } = req.body;
    
    const user = await User.findOne({ username });

    if (user.emailVerificationCode !== code) {
      throw new VerificationError('Invalid verification code');
    }

    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    
    await user.save();
    res.status(200).json({ message: 'Email verified successfully' });

  } catch (error) {
    next(error);
  }

  };
  
// Controller function to verify phone number
exports.verifyPhoneNumber = async (req, res, next) => {
  try {
    const { username, code } = req.body;
    const user = await User.findOne({ username, phoneVerificationCode: code });
    
    if (!user) {
      throw new VerificationError('Invalid verification code');
    }
    
    user.phoneVerified = true;
    user.phoneVerificationCode = undefined;
    
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

    if(!user) {
      throw new NotFoundError('User Not Found');
    }

    if (user.emailVerified && user.phoneVerified)
    {
      user.verificationStatus = 'verified';
      await user.save();

      return res.status(200).json({ message: 'User verified successfully. Now, Login with your credentials'});
    }

    res.status(403).json({ message: 'Email and phone number verification required' });
  } catch (error) {
    next(error);
  }
};