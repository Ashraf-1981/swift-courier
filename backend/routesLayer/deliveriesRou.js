const express = require('express');
const deliveriesSer = require('../servicesLayer/deliveriesSer');
const { verifyToken, requireRole } = require('../middleware/authMid');

const router = express.Router();

// error messages that mean "bad form", not "server broke"
const BAD_INPUT = ['required', 'Payment method', 'Pickup time', 'collect back', 'too big', 'Maximum'];

/**
 * POST /api/deliveries
 * Header: Authorization: Bearer <accessToken>
 * Body: the booking form
 * Only customers can book. Customer id comes from the token, never the form.
 */
router.post('/', verifyToken, requireRole(['customer']), async (req, res) => {
    try {
        const delivery = await deliveriesSer.createDelivery(req.user.id, req.body || {});
        res.status(201).json(delivery);
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        if (BAD_INPUT.some((word) => err.message.includes(word))) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});

/**
 * GET /api/deliveries
 * Header: Authorization: Bearer <accessToken>
 * The logged-in customer's own deliveries, newest first.
 */
router.get('/', verifyToken, requireRole(['customer']), async (req, res) => {
    try {
        res.json(await deliveriesSer.getMyDeliveries(req.user.id));
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;