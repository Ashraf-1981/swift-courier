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

// returned to sender: the sender now owes a return fee
async function setReturnFee(deliveryId, fee) {
  const [result] = await pool.query(
    `UPDATE delivery_payments
     SET return_fee = ?, return_status = 'unpaid'
     WHERE delivery_id = ?`,
    [fee, deliveryId]
  );
  return result.affectedRows;
}

// sender pays the return fee, with the method he picked
async function markReturnPaid(deliveryId, method) {
  const [result] = await pool.query(
    `UPDATE delivery_payments
     SET return_status = 'paid', return_method = ?, return_paid_at = NOW()
     WHERE delivery_id = ? AND return_status = 'unpaid'`,
    [method, deliveryId]
  );
  return result.affectedRows;
}

// COD delivered: courier collected the cash
async function markCodCollected(deliveryId, courierId) {
  const [result] = await pool.query(
    `UPDATE delivery_payments
     SET status = 'paid', paid_at = NOW(), collected_by = ?
     WHERE delivery_id = ? AND method = 'cod' AND status = 'unpaid'`,
    [courierId, deliveryId]
  );
  return result.affectedRows; // 1 = collected, 0 = not COD or already paid
}

module.exports = { createPayment, getPaymentByDeliveryId, markPaid, setReturnFee, markReturnPaid, markCodCollected };