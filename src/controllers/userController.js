// src/controllers/userController.js
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const send_email =  require('../verifications/send_email');
const send_sms = require('../verifications/send_sms');

// Controller function to create a new user for identity verification
exports.createUser = async (req, res) => {
  try {
    // Get user data from the request body
    const { firstName, lastName, dateOfBirth, address, governmentID, username, email, phoneNumber} = req.body;

    // Create a new user record in the database
    const user = new User({
      firstName,
      lastName,
      dateOfBirth,
      address,
      governmentID,
      username,
      email,
      phoneNumber
    });

    // Save the user record in the database
    // user.emailverificationCode = '100100';
    await user.save();

    const token = jwt.sign(
      {
        UserId: user._id, 
        username: user.username
      }, 
        config.jwtSecret,
        {expiresIn: '23h'}
  );

  await send_email.sendVerificationEmail(user);
  await send_sms.sendVerificationSMS(user);

  res.status(201).json({
      message: 'User created successfully. Verification email sent. Verification code sent.',
      user: user,
      token, // Send the JWT token in the response
    }); } catch (error) {

    if (error.code === 11000 || error.name === 'MongoError') {
      // Handle duplicate username error
      return res.status(409).json({ message: 'Username already exists'});
    }

    res.status(500).json({ message: 'Error creating user', error });
    console.log(error)
  }
};


exports.getUserByUsername = async (req, res) => {

  try {
    
    const { username } = req.params;
    const user = await User.findOne({ username });

    if(!user)   return res.status(404).json({message: '3 User not found '})

    return res.status(200).json({
      message : "User information retrieved successfully ✔️",
      user,
    })

  } catch (error) {
    console.error('Error retrieving user information: ', error);
    return res.status(500).json({
      message : 'Error retrieving user information.'
    });
  }




}


exports.updateUser = async (req, res) =>{

  try {
    const { username } = req.params;
    const updatedData = req.body;

    const user = await User.findOne({ username });

    if(!user)   return res.status(404).json({message: "2 User not found"});

    await user.updateInformation(updatedData);

    return res.status(200).json({
      message : "User info updated successfully ✔️",
      user,
    })

  } catch (error) {
    console.error('Error updating user information:', error);
    return res.status(500).json({ message: 'Error updating user information' });

  }
}


exports.deleteUser = async (req, res) => {

  try {

    const { username } = req.params;
    const user = await User.findOneAndDelete({ username });

    if(!user)   return res.status(404).json({message: "1 User not found"});

    return res.status(200).json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ message: 'Error deleting user' });

  }


}

// Function to verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { username, code } = req.params;
    
    // Find the user by the email verification token
    const user = await User.findOne({ username });

    if (user.emailVerificationCode !== code) {
        return res.status(404).json({ message: 'Invalid verification code' });
      }
    // Update user's email verification status
    user.emailVerified = true;
    user.emailVerificationCode = undefined; // Remove the token after verification
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

// Controller function to verify phone number
exports.verifyPhoneNumber = async (req, res) => {
  try {
    const { username, code } = req.body;
    const user = await User.findOne({ username, phoneVerificationCode: code });
    
    if (!user) return res.status(400).json({ message: 'Invalid code' });
    
    user.phoneVerified = true;
    user.phoneVerificationCode = undefined;
    
    await user.save();
    res.status(200).json({ message: 'Phone number verified successfully' });
  
  } catch (error) {
    res.status(500).json({ message: 'Error verifying phone number', error });
  }
};