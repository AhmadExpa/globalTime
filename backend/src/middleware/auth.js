const jwt = require('jsonwebtoken');
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const parts = header.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      const decoded = jwt.verify(parts[1], process.env.JWT_SECRET || 'dev');
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;
      return next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
  return res.status(401).json({ message: 'No token' });
}
