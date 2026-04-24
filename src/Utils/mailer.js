const { Resend } = require('resend');

const sendEmail = async ({ to, subject, text }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to,
    subject,
    text,
  });
};

module.exports = { sendEmail };
