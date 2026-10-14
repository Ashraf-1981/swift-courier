const pool = require('../db');

async function getAllZones() {
  const [rows] = await pool.query('SELECT * FROM zones ORDER BY id');
  return rows;
}

async function getZoneById(id) {
  const [rows] = await pool.query('SELECT * FROM zones WHERE id = ?', [id]);
  return rows[0];
}

module.exports = { getAllZones, getZoneById };