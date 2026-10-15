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

module.exports = { createUser, getUserByEmail, getUserById };