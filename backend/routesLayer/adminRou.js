const express = require('express');
const router = express.Router();
const authSer = require('../servicesLayer/authSer');
const adminSer = require('../servicesLayer/adminSer');
const { requireAdminSession } = require('../middleware/authMid');

// GET /admin → admin home page
router.get('/', requireAdminSession, (req, res) => {
    res.render('admin/home', { title: 'Admin', admin: req.session.admin });
});

// GET /admin/login → show the form
router.get('/login', (req, res) => {
    res.render('admin/login', { error: null });
});

/**
 * POST /admin/login
 * Business rules:
 * 1. Same login check as the app (email + password)
 * 2. Only role 'admin' may enter
 * 3. Save the admin in the session, then go to /admin
 */
router.post('/login', async (req, res) => {
    try {
        const { user } = await authSer.login(req.body);
        if (user.role !== 'admin') {
            return res.render('admin/login', { error: 'Admins only' });
        }
        req.session.admin = { id: user.id, name: user.name };
        res.redirect('/admin');
    } catch (err) {
        res.render('admin/login', { error: err.message });
    }
});

// GET /admin/logout → clear the session
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/admin/login'));
});

// GET /admin/warehouse → parcels waiting for a courier
router.get('/warehouse', requireAdminSession, async (req, res) => {
    const parcels = await adminSer.getWarehouseParcels();
    res.render('admin/warehouse', { admin: req.session.admin, parcels });
});

module.exports = router;