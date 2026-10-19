const deliveriesDat = require('../dataLayer/deliveriesDat');
const couriersDat = require('../dataLayer/couriersDat');
const deliveryStatusHistoryDat = require('../dataLayer/deliveryStatusHistoryDat');
const zonesDat = require('../dataLayer/zonesDat');
const deliveryPaymentsDat = require('../dataLayer/deliveryPaymentsDat');
const aiSer = require('./aiSer');
const usersDat = require('../dataLayer/usersDat');

// Business rule: admin sees warehouse parcels, each with couriers who cover its drop-off zone
async function getWarehouseParcels() {
    const parcels = await deliveriesDat.getWarehouseParcels();
    for (const p of parcels) {
        p.couriers = await couriersDat.getCouriersForZone(p.dropoff_zone_id);
    }
    return parcels;
}

/**
 * Business rules: admin hands a warehouse parcel to a courier
    * 1. Parcel must still be at the warehouse
        * 2. Courier must cover the drop - off zone(normal couriers only)
            * 3. Status goes straight to out_for_delivery + history row
                */
async function assignParcel(adminId, deliveryId, courierId) {
    const parcel = await deliveriesDat.getDeliveryDetail(deliveryId);
    if (!parcel || parcel.status !== 'at_warehouse') {
        throw new Error('Parcel is not at the warehouse');
    }

    // rule 2
    const couriers = await couriersDat.getCouriersForZone(parcel.dropoff_zone_id);
    if (!couriers.some((c) => c.id === courierId)) {
        throw new Error('Courier does not cover this zone');
    }

    // rule 3: only if still at_warehouse (another admin may be faster)
    const changed = await deliveriesDat.updateStatus(deliveryId, 'at_warehouse', 'out_for_delivery', courierId);
    if (changed === 0) {
        throw new Error('Parcel was already handed out');
    }

    await deliveryStatusHistoryDat.addStatus({
        deliveryId,
        oldStatus: 'at_warehouse',
        newStatus: 'out_for_delivery',
        changedBy: adminId,
        note: 'Handed to courier at warehouse',
    });

    return { message: 'Parcel handed out', deliveryId, courierId };
}
const STATUSES = ['pending', 'assigned', 'picked_up', 'at_warehouse', 'out_for_delivery',
    'delivered', 'failed', 'returned', 'cancelled'];
const PAY_STATUSES = ['unpaid', 'paid'];
// a valid date from the form looks like 2026-10-19 (10 characters)
function isDate(value) {
    return typeof value === 'string' && value.length === 10 && !isNaN(new Date(value));
}

// Business rule: admin filters orders by status, payment, zone and date; bad values are ignored
async function getOrders(query) {
    const filters = {};
    if (STATUSES.includes(query.status)) filters.status = query.status;
    if (PAY_STATUSES.includes(query.payment)) filters.payment = query.payment;
    if (Number(query.zoneId) > 0) filters.zoneId = Number(query.zoneId);
    if (isDate(query.from)) filters.from = query.from;
    if (isDate(query.to)) filters.to = query.to;

    const orders = await deliveriesDat.getOrders(filters);
    const zones = await zonesDat.getAllZones(); // for the zone dropdown
    return { orders, zones, filters, statuses: STATUSES };
}

/**
 * Business rules: admin marks an order paid
 * 1. Payment must exist
 * 2. COD is collected by the courier, not the admin
 * 3. Only unpaid can become paid
 */
async function markOrderPaid(deliveryId) {
    const payment = await deliveryPaymentsDat.getPaymentByDeliveryId(deliveryId);
    if (!payment) throw new Error('Payment not found');
    if (payment.method === 'cod') throw new Error('COD is collected by the courier');

    const changed = await deliveryPaymentsDat.markPaid(deliveryId);
    if (changed === 0) throw new Error('Order is already paid');

    return { message: 'Order marked paid', deliveryId };
}

/**
 * Business rules: admin searches orders in plain English (structured generation)
 * 1. Gemini turns the sentence into JSON filters, using our real statuses and zones
 * 2. The JSON goes through getOrders, so any wrong value is ignored there
 */
async function searchOrdersByText(text) {
    if (!text || !text.trim()) throw new Error('Please type what you are looking for');

    const zones = await zonesDat.getAllZones();
    const today = new Date().toISOString().slice(0, 10);

    const rules = `You turn an admin's search sentence into JSON filters for a courier orders list.
Return ONLY this JSON shape, leaving out any filter that is not mentioned:
{"status": string, "payment": string, "zoneId": number, "from": "YYYY-MM-DD", "to": "YYYY-MM-DD"}
status must be one of: ${STATUSES.join(', ')}
payment must be one of: unpaid, paid
zoneId must be one of these ids: ${zones.map((z) => `${z.id}=${z.name}`).join(', ')}
Today is ${today}. Work out dates like "yesterday" or "last week" from today.
If only one day is mentioned, set both "from" and "to" to that day.`;

    const filters = await aiSer.askJson(rules, text);
    return getOrders(filters);
}

const ROLES = ['customer', 'courier', 'admin'];

// Business rule: admin filters users by role and name/email; bad values are ignored
async function getUsers(query) {
    const filters = {};
    if (ROLES.includes(query.role)) filters.role = query.role;
    if (typeof query.search === 'string' && query.search.trim()) filters.search = query.search.trim();

    const users = await usersDat.getUsers(filters);
    return { users, filters, roles: ROLES };
}

module.exports = { getWarehouseParcels, assignParcel, getOrders, markOrderPaid, searchOrdersByText, getUsers };