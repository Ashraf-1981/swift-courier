const express = require("express");
const cors = require("cors");
const pool = require("./db");
const feeRou = require("./routesLayer/feeRou");
const authRou = require("./routesLayer/authRou");
const deliveriesRou = require("./routesLayer/deliveriesRou");
const couriersRou = require('./routesLayer/couriersRou');
const deliveryTypesRou = require("./routesLayer/deliveryTypesRou");
const zonesRou = require("./routesLayer/zonesRou");
const path = require("path");
const adminRou = require("./routesLayer/adminRou");

const app = express();
app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); // read HTML form data
app.use("/api/fee", feeRou);
app.use("/api/auth", authRou);
app.use("/api/deliveries", deliveriesRou);
app.use("/api/couriers", couriersRou);
app.use("/api/delivery-types", deliveryTypesRou);
app.use("/api/zones", zonesRou);
app.use("/admin", adminRou);

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