
const { createLogger, transports, format } = require('winston');

const logger = createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV === 'test') {
  logger.transports.forEach((t) => (t.silent = true));
}

module.exports = logger;
