const express = require('express');
const zonesSer = require('../servicesLayer/zonesSer');

const router = express.Router();

/**
 * GET /api/zones
 * Public: the area list for the pickup and drop-off dropdowns.
 */
router.get('/', async (req, res) => {
  try {
    res.json(await zonesSer.getZones());
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;