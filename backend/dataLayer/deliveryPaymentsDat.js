const pool = require('../db');

// used by create delivery: data keys must match the column names
async function createPayment(data) {
  const [result] = await pool.query('INSERT INTO delivery_payments SET ?', [data]);
  return result.insertId;
}

async function getPaymentByDeliveryId(deliveryId) {
  const [rows] = await pool.query(
    'SELECT * FROM delivery_payments WHERE delivery_id = ?',
    [deliveryId]
  );
  return rows[0]; // undefined if not found
}

// simulated payment: mark one delivery's payment as paid
async function markPaid(deliveryId) {
  const [result] = await pool.query(
    `UPDATE delivery_payments
     SET status = 'paid', paid_at = NOW()
     WHERE delivery_id = ? AND status = 'unpaid'`,
    [deliveryId]
  );
  return result.affectedRows; // 1 = updated, 0 = nothing changed
}
module.exports = { createPayment, getPaymentByDeliveryId, markPaid };