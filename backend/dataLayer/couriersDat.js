const pool = require('../db');

// one courier (is_express decides normal vs express jobs)
async function getCourierById(id) {
  const [rows] = await pool.query(
    `SELECT id, name, is_express FROM users WHERE id = ? AND role = 'courier'`,
    [id]
  );
  return rows[0];
}

// the zone ids this courier covers, e.g. [1, 2, 11]
async function getZoneIds(courierId) {
  const [rows] = await pool.query(
    `SELECT zone_id FROM courier_zones WHERE courier_id = ?`,
    [courierId]
  );
  return rows.map((r) => r.zone_id);
}

module.exports = { getCourierById, getZoneIds };