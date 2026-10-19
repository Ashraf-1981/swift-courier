const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/authMid');
const assistantSer = require('../servicesLayer/assistantSer');
const logger = require('../utils/logger');

/**
 * POST /api/assistant/ask
 * Header: Authorization: Bearer <accessToken>
 * Body: { "question": "..." }
 */
router.post('/ask', verifyToken, requireRole(['customer']), async (req, res) => {
    try {
        const { question } = req.body || {};
        res.json(await assistantSer.ask(req.user.id, question));
    } catch (err) {
        logger.error('Assistant error:', err.message);
        if (err.message.includes('type a question') || err.message.includes('too long')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Ask Swift is not available right now, please try again' });
    }
});

module.exports = router;