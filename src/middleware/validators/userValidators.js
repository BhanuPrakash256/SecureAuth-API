const { body } = require('express-validator');

const createUserValidators = [
  body('firstName').trim().notEmpty().withMessage('firstName is required'),
  body('lastName').trim().notEmpty().withMessage('lastName is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phoneNumber')
    .matches(/^\+[1-9]\d{7,14}$/)
    .withMessage('phoneNumber must be E.164 format (e.g. +14155551234)'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('dateOfBirth must be a valid date (YYYY-MM-DD)')
    .custom((val) => {
      if (new Date(val) >= new Date()) throw new Error('dateOfBirth must be in the past');
      return true;
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters'),
  body('username').trim().notEmpty().withMessage('username is required'),
  body('address').trim().notEmpty().withMessage('address is required'),
  body('governmentID').trim().notEmpty().withMessage('governmentID is required'),
];

module.exports = { createUserValidators };
