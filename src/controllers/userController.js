// src/controllers/userController.js

const User = require('../models/User');
const send_email =  require('../verifications/email');
const send_sms = require('../verifications/sms');

// Controller function to create a new user for identity verification
exports.createUser = async (req, res) => {
  try {
    // Get user data from the request body
    const { firstName, lastName, dateOfBirth, address, governmentID, username, password, email, phoneNumber} = req.body;

    // Create a new user record in the database
    const user = new User({
      firstName,
      lastName,
      dateOfBirth,
      address,
      governmentID,
      username,
      password,
      email,
      phoneNumber
    });

    // Save the user record in the database
    await user.save();


  await send_email.sendVerificationEmail(user);
  await send_sms.sendVerificationSMS(user);

  res.status(201).json({
      message: 'User created successfully. Verification email sent. Verification code sent.',
    }); 
  } catch (error) {

    if (error.code === 11000 || error.name === 'MongoError') {
      // Handle duplicate username error
      return res.status(409).json({ message: 'Username already exists'});
    }

    res.status(500).json({ message: 'Error creating user', error });
  }
};


exports.getUserByUsername = async (req, res) => {
  try {
    
    const { username } = req.params;
    const user = await User.findOne({ username });

    if(!user)   return res.status(404).json({message: 'User not found '})

    return res.status(200).json({
      message : "User information retrieved successfully ✔️",
      user,
    })

  } catch (error) {
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
    return res.status(500).json({ message: 'Error deleting user' });

  }


}