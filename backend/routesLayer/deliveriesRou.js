const express = require('express');
const deliveriesSer = require('../servicesLayer/deliveriesSer');
const { verifyToken, requireRole } = require('../middleware/authMid');
const paymentsSer = require('../servicesLayer/paymentsSer');

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

/**
 * GET /api/deliveries/:id
 * Header: Authorization: Bearer <accessToken>
 * One of the logged-in customer's deliveries, with full details.
 */
router.get('/:id', verifyToken, requireRole(['customer']), async (req, res) => {
    try {
        res.json(await deliveriesSer.getMyDeliveryById(req.user.id, Number(req.params.id)));
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});

/**
 * POST /api/deliveries/:id/pay
 * Header: Authorization: Bearer <accessToken>
 * Simulated payment for an online-paid delivery.
 */
router.post('/:id/pay', verifyToken, requireRole(['customer']), async (req, res) => {
    try {
        res.json(await paymentsSer.payDelivery(req.user.id, Number(req.params.id)));
    } catch (err) {
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('Cash on delivery') || err.message.includes('already paid')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;