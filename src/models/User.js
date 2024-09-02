
const mongoose = require('mongoose');
const Joi = require('joi');
const { hashPassword, comparePassword} = require('../Utils/hashPassword');

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
    type: Joi.date(),
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
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  username: {
    type : String,
    required : [true, 'username is required'],
    unique : true,
  },
  password: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },

  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },

  phoneVerified: { type: Boolean, default: false },
  phoneVerificationCode: { type: String },
  
  tokenVersion: {type: Number, default: 0},
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});


// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await hashPassword(this.password);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
  return await comparePassword(password, this.password);
};

function validateUser(user){

  const schema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(50).required(),
    dateOfBirth: Joi.date().min('1-1-1974').max('now'),
    address: Joi.string().min(5).max(50).required(),
    governmentID: Joi.string().min(5).max(50).required(),
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(8).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    phoneNumber: Joi.string().length(13).pattern(/^\+91[0-9]{10}$/).required(),
  });

  return schema.validate(user);

};


const User = mongoose.model('User', userSchema);

module.exports = { User, validateUser};