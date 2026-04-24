const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  logger.error(message, { method: req.method, path: req.path, statusCode });

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
