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

/**
 * POST /api/couriers/jobs/:id/accept
 * Header: Authorization: Bearer <accessToken>
 * Courier accepts a job (first one wins).
 */
router.post('/jobs/:id/accept', verifyToken, requireRole(['courier']), async (req, res) => {
    try {
        res.json(await couriersSer.acceptJob(req.user.id, Number(req.params.id)));
    } catch (err) {
        console.error('Accept job error:', err.message);
        if (err.message.includes('not available')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('already taken')) {
            return res.status(409).json({ error: err.message });
        }
        if (err.message.includes('current job') || err.message.includes('in hand')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});

/**
 * POST /api/couriers/jobs/:id/status
 * Header: Authorization: Bearer <accessToken>
 * Body: { "status": "picked_up" | "at_warehouse" | "out_for_delivery" }
 */
router.post('/jobs/:id/status', verifyToken, requireRole(['courier']), async (req, res) => {
    try {
        const { status, reason } = req.body || {};
        res.json(await couriersSer.updateJobStatus(req.user.id, Number(req.params.id), status, reason));
    } catch (err) {
        console.error('Job status error:', err.message);
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('Cannot change') || err.message.includes('reason') || err.message.includes('Doorstep')) {
            return res.status(400).json({ error: err.message });
        }
        if (err.message.includes('someone else')) {
            return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});
module.exports = router;