const jwt = require('jsonwebtoken');
/**
 * Business rules: verifyToken
 * 1. Access token must be in the header: Authorization: Bearer <token> (arc)
 * 2. It must be signed with TOKEN_SECRET and not expired
 * 3. If OK, puts { id, role } on req.user for the route to use
 */
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.split(' ')[1]; // "Bearer eyJ..." → "eyJ..."

  if (!token) {
    return res.status(401).json({ error: 'Please log in' });
  }

  try {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next(); // open the door, go to the route

  } catch (err) {
    return res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

module.exports = { verifyToken };