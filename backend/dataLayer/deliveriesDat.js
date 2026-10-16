const pool = require('../db');

// used by create delivery: data keys must match the column names
async function createDelivery(data) {
  const [result] = await pool.query('INSERT INTO deliveries SET ?', [data]);
  return result.insertId; // the new delivery's id
}

async function getDeliveryById(id) {
  const [rows] = await pool.query('SELECT * FROM deliveries WHERE id = ?', [id]);
  return rows[0]; // undefined if not found
}

// used by "My deliveries": one customer's list, with names instead of ids
async function getDeliveriesByCustomer(customerId) {
  const [rows] = await pool.query(
    `SELECT d.id, d.tracking_no, d.status, d.total_fee,
            d.scheduled_pickup_at, d.deadline_at, d.created_at,
            t.name  AS vehicle,
            pz.name AS pickup_zone,
            dz.name AS dropoff_zone,
            p.method AS payment_method,
            p.status AS payment_status
     FROM deliveries d
     JOIN delivery_types t ON t.id = d.delivery_type_id
     JOIN zones pz ON pz.id = d.pickup_zone_id
     JOIN zones dz ON dz.id = d.dropoff_zone_id
     LEFT JOIN delivery_payments p ON p.delivery_id = d.id
     WHERE d.customer_id = ?
     ORDER BY d.created_at DESC`,
    [customerId]
  );
  return rows;
}

// used by the tracking page: one delivery with names, payment and courier
async function getDeliveryDetail(id) {
  const [rows] = await pool.query(
    `SELECT d.*,
            t.name  AS vehicle,
            pz.name AS pickup_zone, pz.restricted_note AS pickup_note,
            dz.name AS dropoff_zone, dz.restricted_note AS dropoff_note,
            p.method AS payment_method, p.status AS payment_status,
            c.name  AS courier_name, c.phone AS courier_phone
     FROM deliveries d
     JOIN delivery_types t ON t.id = d.delivery_type_id
     JOIN zones pz ON pz.id = d.pickup_zone_id
     JOIN zones dz ON dz.id = d.dropoff_zone_id
     LEFT JOIN delivery_payments p ON p.delivery_id = d.id
     LEFT JOIN users c ON c.id = d.courier_id
     WHERE d.id = ?`,
    [id]
  );
  return rows[0];
}

module.exports = { createDelivery, getDeliveryById, getDeliveriesByCustomer, getDeliveryDetail };