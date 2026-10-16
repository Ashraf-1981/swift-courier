const express = require('express');
const authSer = require('../servicesLayer/authSer');

const router = express.Router();

/**
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

module.exports = router;