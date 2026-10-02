export const errorHandler = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
  const status = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';
  res.status(status).json({ success: false, error: { code, message }, message: message || code });
};
