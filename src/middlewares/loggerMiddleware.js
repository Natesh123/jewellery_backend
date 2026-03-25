const logger = (req, res, next) => {
  res.on('finish', () => {
    console.log(
      `${req.method} ${res.statusCode} ${req.protocol}://${req.get('host')}${req.originalUrl}`
    );
  });
  next();
};

module.exports = logger;
