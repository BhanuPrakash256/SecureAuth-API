const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail } = require('../utils/mailer');
const NotFoundError = require('../Utils/errors/NotFoundError');
const { BadRequestError } = require('../Utils/errors/BadRequestError');

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/api/v1/users/reset-password/${token}`;
    const message =
      `We heard that you lost your account password. Sorry about that!\n\n` +
      `You can reset it using the link below:\n\n` +
      `${resetLink}\n\n` +
      `If you did not request this, please ignore this email.\n`;

    await sendEmail({
      to: user.email,
      subject: '[Games] Please reset your password',
      text: message,
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    next(error);
  }
};
