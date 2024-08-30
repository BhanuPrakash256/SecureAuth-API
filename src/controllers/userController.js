// src/controllers/userController.js

const {User, validateUser} = require('../models/User');
const { BadRequestError } = require('../Utils/errors/BadRequestError');
const CustomError = require('../Utils/errors/CustomError');
const NotFoundError = require('../Utils/errors/NotFoundError');
const send_email =  require('../verifications/email');
const send_sms = require('../verifications/sms');

// Controller function to create a new user for identity verification
exports.createUser = async (req, res, next) => {
  try {

    const { error } = validateUser(req.body);
    if (error) throw new BadRequestError(error.details[0].message);

    // Get user data from the request body
    const { firstName, lastName, dateOfBirth, address, governmentID, username, password, email, phoneNumber} = req.body;

    let user = await User.findOne({ username });
    if (user) {
        throw new CustomError('Username already exists', 409);
    };

    user = await User.findOne({ email });
    if (user) {
        throw new CustomError('Email already exists', 409);
    };

    // Create a new user record in the database
    const newUser = new User({
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
    await newUser.save();


    await send_email.sendVerificationEmail(newUser);
    await send_sms.sendVerificationSMS(newUser);

    res.status(201).json({ 
      message: `User created successfully. Verification email sent. Verification code sent.`
  }); 
     
  } catch (error) {
      next(error);
  }
};


exports.getUserByUsername = async (req, res, next) => {
  try {
    
    const { username } = req.params;
    const user = await User.findOne({ username });

    if(!user) {
      throw new NotFoundError('User Not Found');
    }

    const result = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      address: user.address,
      governmentID: user.governmentID,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    return res.status(200).json({
      message : "User information retrieved successfully ✔️",
      result,
    })

  } catch (error) {
    next(error);
  }
}


exports.updateUser = async (req, res, next) =>{

  try {
    const { error } = validateUser(req.body);
    if (error) throw new BadRequestError(error.details[0].message);

    const { username } = req.params;
    const updatedData = req.body;

    const user = await User.findOneAndUpdate({ username }, updatedData);

    if(!user) {
      throw new NotFoundError('User Not Found');
    }

    return res.status(200).json({ message : "User info updated successfully ✔️"})

  } catch (error) {
      next(error);
  }
}


exports.deleteUser = async (req, res, next) => {

  try {

    const { username } = req.params;
    const user = await User.findOneAndDelete({ username });

    if(!user) {
      throw new NotFoundError('User Not Found');
    }

    return res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
      next(error);
  }


}