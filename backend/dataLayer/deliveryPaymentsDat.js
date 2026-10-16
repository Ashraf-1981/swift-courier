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

module.exports = { createPayment, getPaymentByDeliveryId };