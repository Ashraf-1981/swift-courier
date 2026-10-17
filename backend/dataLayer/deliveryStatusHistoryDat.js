const pool = require('../db');

// add one row each time a delivery's status changes
async function addStatus({ deliveryId, oldStatus, newStatus, changedBy, note }) {
  const [result] = await pool.query(
    `INSERT INTO delivery_status_history (delivery_id, old_status, new_status, changed_by, note)
     VALUES (?, ?, ?, ?, ?)`,
    [deliveryId, oldStatus, newStatus, changedBy, note || null]
  );
  return result.insertId;
}

// the timeline for one delivery, oldest first
async function getHistoryByDelivery(deliveryId) {
  const [rows] = await pool.query(
    `SELECT new_status, note, created_at
     FROM delivery_status_history
     WHERE delivery_id = ?
     ORDER BY created_at, id`,
    [deliveryId]
  );
  return rows;
}

module.exports = { addStatus, getHistoryByDelivery };