const pool = require('../db');

// remove old help texts before seeding again
async function deleteAll() {
  await pool.query('DELETE FROM knowledge_chunks');
}

async function addChunk(title, content, embedding) {
  const [result] = await pool.query(
    'INSERT INTO knowledge_chunks (title, content, embedding) VALUES (?, ?, ?)',
    [title, content, JSON.stringify(embedding)]
  );
  return result.insertId;
}

// all chunks, embedding comes back as an array (mysql2 parses JSON columns)
async function getAllChunks() {
  const [rows] = await pool.query('SELECT id, title, content, embedding FROM knowledge_chunks');
  return rows;
}

module.exports = { deleteAll, addChunk, getAllChunks };