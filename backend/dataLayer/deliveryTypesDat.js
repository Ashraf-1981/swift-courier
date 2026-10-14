const pool = require('../db');

async function getAllDeliveryTypes() {
    // start from the cheapest delivery type and go up to the most expensive
    const [rows] = await pool.query('SELECT * FROM delivery_types ORDER BY id');
    return rows;
}

async function getDeliveryTypeById(id) {
    const [rows] = await pool.query('SELECT * FROM delivery_types WHERE id = ?', [id]);
    return rows[0];
}

module.exports = { getAllDeliveryTypes, getDeliveryTypeById };