function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(statusCode).json({ error: message });
}

module.exports = { errorHandler };
