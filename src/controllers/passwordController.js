const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const NotFoundError = require('../Utils/errors/NotFoundError');
const { BadRequestError } = require('../Utils/errors/BadRequestError');

const sendEmail = async (email, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

  const mailOptions = {
    from: '"Games🎮" <verify-email@games.com>',
    to: email,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError('User Not Found');
    }

    // Generate a token and set expiration date
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email with reset link
    const resetLink = `http://localhost:3000/api/users/reset-password/${token}`;
    const message = `We heard that you lost your account password. Sorry about that!\n\n` +
                    `But don't worry! You can use the following button to reset your password:\n\n` +
                    `${resetLink}\n\n` +
                    `If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    await sendEmail(user.email, '[Games🎮] Please reset your password', message);

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
      throw new BadRequestError('Bad Request - Password reset token is invalid or has expired!');
    }

    // Update user's password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    next(error);
  }
};
