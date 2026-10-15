const express = require('express');
const authSer = require('../servicesLayer/authSer');

const router = express.Router();

// POST /api/auth/register  body: { name, email, phone, password }
router.post('/register', async (req, res) => {
  try {
    const user = await authSer.register(req.body);
    res.status(201).json(user); 
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login  body: { email, password }
router.post('/login', async (req, res) => {
  try {
    const result = await authSer.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;