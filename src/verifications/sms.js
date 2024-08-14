const twilio = require("twilio")

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);


exports.sendVerificationSMS = async (user) => {

    try {
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
        await client.messages.create({
          body: `Your verification code is ${verificationCode}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.phoneNumber
        });
      
        user.phoneVerificationCode = verificationCode;
        await user.save();

    } catch (error) {
        console.error('Error sending verification code:', error);
    }


};