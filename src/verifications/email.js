const nodemailer = require('nodemailer')


exports.sendVerificationEmail = async (user) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
                
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationCode = verificationCode;


        // Email options
        let mailOptions = 
        {
            from: '"Games🎮" <verify-email@games.com>',
            to: user.email,
            subject: 'Games Verification Code',
            text: `Dear User,
        
        Thank you for registering. Please use the following verification code to complete your registration:
        
        ${verificationCode}
        
        If you did not request this code, please ignore this email.
        
        Thank you,
        Games Team`,
        };

        await transporter.sendMail(mailOptions);

        console.log('Verification email sent to:', user.email)
                
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

