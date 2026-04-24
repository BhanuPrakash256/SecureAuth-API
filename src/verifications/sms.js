const twilio = require('twilio');
const crypto = require('crypto');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendVerificationSMS = async (user) => {
  const verificationCode = crypto.randomInt(100000, 999999).toString();

  await client.messages.create({
    body: `Your verification code is ${verificationCode}. Expires in 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: user.phoneNumber,
  });

  user.phoneVerificationCode = verificationCode;
  user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
};
