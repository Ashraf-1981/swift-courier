const express = require('express');
const feeSer = require('../servicesLayer/feeSer');
const vehicleSer = require('../servicesLayer/vehicleSer');

const router = express.Router();

/**
 * Returns the price breakdown
 */
router.get('/', async (req, res) => {
    const type = Number(req.query.type);
    const pickup = Number(req.query.pickup);
    const dropoff = Number(req.query.dropoff);
    const stops = Number(req.query.stops || 0);
    const time = req.query.time || new Date(); // no time given → use server's clock (erp)
    const collect = req.query.collect === 'true'; // ?collect=true → true, anything else → false
    const weight = Number(req.query.weight);
    const length = Number(req.query.length);
    const width = Number(req.query.width);
    const height = Number(req.query.height);

    // input check: type, pickup and dropoff must be given
    if (!type || !pickup || !dropoff) {
        return res.status(400).json({ error: 'type, pickup and dropoff are required' });
    }
    // input check: time must be a real date              
    if (isNaN(new Date(time))) {
        return res.status(400).json({ error: 'time must be a valid date, e.g. 2026-10-16T08:30' });
    }
    if (!weight || !length || !width || !height) {
        return res.status(400).json({ error: 'weight, length, width and height are required' });
    }

    try {
        const vehicle = await vehicleSer.suggestVehicle({
            deliveryTypeId: type,
            weightKg: weight,
            lengthCm: length,
            widthCm: width,
            heightCm: height,
        });

        const fee = await feeSer.calculateTotalFee({
            deliveryTypeId: vehicle.suggested_id,
            pickupZoneId: pickup,
            dropoffZoneId: dropoff,
            extraStops: stops,
            pickupTime: time,
            collectBack: collect,
        });
        res.json({ vehicle, fee });

    } catch (err) {
        // "Zone not found" or "Delivery type not found" → 404
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('too big')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = router;