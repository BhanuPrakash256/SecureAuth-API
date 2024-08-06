// src/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  governmentID: {
    type: String,
    required: true,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  username: {
    type : String,
    required : [true, 'username is required'],
    unique : true,
  },
  email: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },

  // phoneNumber: { type: String, required: true },
  // phoneVerified: { type: Boolean, default: false },
  // phoneVerificationCode: { type: String }
  
});


userSchema.methods.updateInformation = async function (updatedData){

  Object.assign(this, updatedData);

  await this.save();
};


const User = mongoose.model('User', userSchema);

module.exports = User;
