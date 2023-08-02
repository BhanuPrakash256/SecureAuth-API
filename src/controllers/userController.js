// src/controllers/userController.js

const User = require('../models/User');

// Controller function to create a new user for identity verification
exports.createUser = async (req, res) => {
  try {
    // Get user data from the request body
    const { firstName, lastName, dateOfBirth, address, governmentID } = req.body;

    // Create a new user record in the database
    const user = new User({
      firstName,
      lastName,
      dateOfBirth,
      address,
      governmentID,
    });

    // Save the user record in the database
    await user.save();

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};
