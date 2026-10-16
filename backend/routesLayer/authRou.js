const express = require('express');
const authSer = require('../servicesLayer/authSer');
const { verifyToken, requireRole } = require('../middleware/authMid');

const router = express.Router();

/**
 * Authentication routes
 * POST /api/auth/register
 * Body: { name, email, phone, password }
 */
router.post('/register', async (req, res) => {
  try {
    const user = await authSer.register(req.body || {});
    res.status(201).json(user);

  } catch (err) {

    if (err.message.includes('already registered')) {
      return res.status(409).json({ error: err.message });
    }
    // missing field or short password → 400
    if (err.message.includes('required') || err.message.includes('at least')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const result = await authSer.login(req.body || {});
    res.json(result);

  } catch (err) {
    // wrong email or password → 401
    res.status(401).json({ error: err.message });
  }
});

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    const result = await authSer.refresh(refreshToken);
    res.json(result);

  } catch (err) {
    // missing, fake, expired or logged-out token → 401
    res.status(401).json({ error: err.message });
  }
});

/**
 * POST /api/auth/logout
 * Body: { refreshToken }
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    const result = await authSer.logout(refreshToken);
    res.json(result);

  } catch (err) {
    // logout itself never fails, so this only happens if the database breaks
    res.status(500).json({ error: 'Something went wrong' });
  }
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <accessToken>(arc)
 * Returns who is logged in (from the token).
 */
router.get('/me', verifyToken, (req, res) => {
  res.json(req.user);
});

// require Role
// TEMPORARY: test the role guard, remove when real admin routes exist
router.get('/admin-only', verifyToken, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Welcome, admin', user: req.user });
});


module.exports = router;