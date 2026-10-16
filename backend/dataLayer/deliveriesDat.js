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

module.exports = { createDelivery, getDeliveryById };