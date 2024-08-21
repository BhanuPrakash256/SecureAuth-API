const User = require('../models/User');

// Function to verify email
exports.verifyEmail = async (req, res) => {
    try {
      const { username, code } = req.body;
      
      const user = await User.findOne({ username });
  
      if (user.emailVerificationCode !== code) {
          return res.status(404).json({ message: 'Invalid verification code' });
        }

      user.emailVerified = true;
      user.emailVerificationCode = undefined;
      
      await user.save();
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) 
    {
      res.status(500).json({ message: 'Error verifying email' });
    }
  };
  
  // Controller function to verify phone number
  exports.verifyPhoneNumber = async (req, res) => {
    try {
      const { username, code } = req.body;
      const user = await User.findOne({ username, phoneVerificationCode: code });
      
      if (!user) 
      {
          return res.status(400).json({ message: 'Invalid code' });
      }
      
      user.phoneVerified = true;
      user.phoneVerificationCode = undefined;
      
      await user.save();
      res.status(200).json({ message: 'Phone number verified successfully' });
    
    } catch (error)
    {
      res.status(500).json({ message: 'Error verifying phone number'});
    }
  };


  exports.updateVerificationStatus = async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username });

      if (!user)
      {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.emailVerified && user.phoneVerified)
      {
        user.verificationStatus = 'verified';
        await user.save();

        return res.status(200).json({ message: 'User verified successfully. Now, Login with your credentials'});
      }
  
      res.status(400).json({ message: 'Email and phone number verification required' });
    } catch (error)
    {
      res.status(500).json({ message: 'Error updating verification status', error });
    }
  };