const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Swift-Courier" });
});

app.get("/api/db-check", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT VERSION() AS version");
    res.json({ connected: true, version: rows[0].version });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});