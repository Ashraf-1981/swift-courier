const pool = require('../db');

async function createUser({ name, email, phone, passwordHash, role }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, passwordHash, role]
  );
  return result.insertId;
}

// used by login: needs password_hash to compare
async function getUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

// used after login: never send password_hash out
async function getUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

// admin users list: optional role + name/email search, never the password hash
async function getUsers({ role, search }) {
  const where = [];
  const params = [];
  if (role) { where.push('u.role = ?'); params.push(role); }
  if (search) {
    where.push('(u.name LIKE ? OR u.email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.is_express, u.created_at,
            (SELECT GROUP_CONCAT(z.name ORDER BY z.name SEPARATOR ', ')
               FROM courier_zones cz JOIN zones z ON z.id = cz.zone_id
              WHERE cz.courier_id = u.id) AS zones,
            (SELECT COUNT(*) FROM deliveries d WHERE d.customer_id = u.id) AS order_count
     FROM users u
     ${whereSql}
     ORDER BY u.role, u.name`,
    params
  );
  return rows;
}

module.exports = { createUser, getUserByEmail, getUserById, getUsers };