const pool = require('../db');

// used by logout: save the token so it can't be used again
async function addToken({ token, expiresAt }) {
  const [result] = await pool.query(
    'INSERT INTO token_blacklist (token, expires_at) VALUES (?, ?)',
    [token, expiresAt]
  );
  return result.insertId;
}

// used by refresh: is this token on the list?
async function findToken(token) {
  const [rows] = await pool.query(
    'SELECT * FROM token_blacklist WHERE token = ?',
    [token]
  );
  return rows[0]; 
}

module.exports = { addToken, findToken };