const app = require('./app');
const port = process.env.PORT || 3000;
const logger = require('../src/Utils/logger');

// console.log(port)
const server = app.listen(port, () => {
  logger.info(`Server started on port ${port} ✔️`);
});

module.exports = server;