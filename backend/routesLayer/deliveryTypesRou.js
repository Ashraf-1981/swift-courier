const express = require('express');
const deliveryTypesSer = require('../servicesLayer/deliveryTypesSer');

const router = express.Router();

/**
 * GET /api/delivery-types
 * Public: the vehicle list for the home page and booking form.
 */
router.get('/', async (req, res) => {
  try {
    res.json(await deliveryTypesSer.getActiveTypes());
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;