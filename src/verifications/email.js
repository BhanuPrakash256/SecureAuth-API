const { Resend } = require('resend');
const crypto = require('crypto');

exports.sendVerificationEmail = async (user) => {
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  user.emailVerificationCode = verificationCode;
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'verify@yourdomain.com',
    to: user.email,
    subject: 'Your Email Verification Code',
    text: `Your verification code is: ${verificationCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
  });
};
