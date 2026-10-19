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
    res.render('admin/warehouse', {
        admin: req.session.admin,
        parcels,
        msg: req.query.msg,
        error: req.query.error,
    });
});
/**
 * POST /admin/warehouse/:id/assign
 * Business rules:
 * 1. Admin only (session)
 * 2. Rules are checked in adminSer.assignParcel
 * 3. Go back to the warehouse list with a message
 */
router.post('/warehouse/:id/assign', requireAdminSession, async (req, res) => {
    try {
        const deliveryId = Number(req.params.id);
        const courierId = Number(req.body.courierId);
        await adminSer.assignParcel(req.session.admin.id, deliveryId, courierId);
        res.redirect('/admin/warehouse?msg=' + encodeURIComponent('Parcel handed out'));
    } catch (err) {
        res.redirect('/admin/warehouse?error=' + encodeURIComponent(err.message));
    }
});
// GET /admin/orders → all orders, filters come from the query string
router.get('/orders', requireAdminSession, async (req, res) => {
    const data = await adminSer.getOrders(req.query);
    res.render('admin/orders', {
        admin: req.session.admin,
        ...data,
        msg: req.query.msg,
        error: req.query.error,
    });
    // POST /admin/orders/:id/paid → rules are in adminSer.markOrderPaid
    router.post('/orders/:id/paid', requireAdminSession, async (req, res) => {
        try {
            await adminSer.markOrderPaid(Number(req.params.id));
            res.redirect('/admin/orders?msg=' + encodeURIComponent('Order marked paid'));
        } catch (err) {
            res.redirect('/admin/orders?error=' + encodeURIComponent(err.message));
        }
    })
    });

    module.exports = router;