const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMid');
const couriersSer = require('../servicesLayer/couriersSer');

/**
 * GET /api/couriers/jobs
 * Header: Authorization: Bearer <accessToken>
 * Jobs the logged-in courier is allowed to accept.
 */
router.get('/jobs', verifyToken, requireRole(['courier']), async (req, res) => {
  try {
    res.json(await couriersSer.getAvailableJobs(req.user.id));
  } catch (err) {
    console.error('Courier jobs error:', err.message);
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;