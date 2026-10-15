const express = require('express');
const feeSer = require('../servicesLayer/feeSer');

const router = express.Router();

/**
 * GET /api/fee?type=2&pickup=8&dropoff=7&stops=1
 * Returns the price breakdown
 */
router.get('/', async (req, res) => {
    const type = Number(req.query.type);
    const pickup = Number(req.query.pickup);
    const dropoff = Number(req.query.dropoff);
    const stops = Number(req.query.stops || 0);
    const time = req.query.time || new Date(); // no time given → use now
    const collect = req.query.collect === 'true'; // ?collect=true → true, anything else → false

    // input check: type, pickup and dropoff must be given
    if (!type || !pickup || !dropoff) {
        return res.status(400).json({ error: 'type, pickup and dropoff are required' });
    }
    // input check: time must be a real date              
    if (isNaN(new Date(time))) {
        return res.status(400).json({ error: 'time must be a valid date, e.g. 2026-10-16T08:30' });
    }

    try {
        const fee = await feeSer.calculateTotalFee({  // ⬅ CHANGED: one object with names
            deliveryTypeId: type,
            pickupZoneId: pickup,
            dropoffZoneId: dropoff,
            extraStops: stops,
            pickupTime: time,
            collectBack: collect,
        });
        res.json(fee);
    } catch (err) {
        // "Zone not found" or "Delivery type not found" → 404
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;