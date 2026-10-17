const express = require('express');
const router = express.Router();

// GET /admin → admin home page
router.get('/', (req, res) => {
    res.render('admin/home', { title: 'Admin' });
});

module.exports = router;