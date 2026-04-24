const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../Utils/errors/BadRequestError');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(e => e.msg).join(', ');
    return next(new BadRequestError(message));
  }
  next();
};

module.exports = handleValidation;
