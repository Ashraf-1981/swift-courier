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

/**
 * Business rules: requireRole
 * 1. Runs after verifyToken (needs req.user)
 * 2. Only the roles in the list may continue, e.g. requireRole(['admin'])
 * 3. Logged in but wrong role → 403
 */
function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You are not allowed to do this' });
    }
    next();
  };
}

/**
 * Business rules: requireAdminSession (EJS admin pages)
 * 1. Admin must be logged in through /admin/login (session)
 * 2. Not logged in → go to the login page
 */
function requireAdminSession(req, res, next) {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }
  next();
}

module.exports = { verifyToken, requireRole, requireAdminSession };