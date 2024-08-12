// src/models/User.js

const mongoose = require('mongoose');
const bcrypt =  require('bcrypt');

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
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  username: {
    type : String,
    required : [true, 'username is required'],
    unique : true,
  },
  password: { type: String, required: true },
  email: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String },

  phoneNumber: { type: String, required: true },
  phoneVerified: { type: Boolean, default: false },
  phoneVerificationCode: { type: String },
  
  tokenVersion: {type: Number, default: 0},
});


userSchema.methods.updateInformation = async function (updatedData){

  Object.assign(this, updatedData);

  await this.save();
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
