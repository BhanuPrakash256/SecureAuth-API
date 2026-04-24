const versionMiddleware = (req, res, next) => {
  res.setHeader('X-API-Version', '1');
  next();
};

module.exports = versionMiddleware;
