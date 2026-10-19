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
const fs = require("fs");
const adminRou = require("./routesLayer/adminRou");
const assistantRou = require("./routesLayer/assistantRou");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");

// stop password guessing: 10 login tries per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Too many login attempts, please try again in 15 minutes" },
});

// protect the Gemini quota: 20 questions per 15 min per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { error: "Too many questions, please wait a few minutes" },
});

const app = express();
// log every request: method, url, status, time taken
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const msg = `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`;
    res.statusCode >= 500 ? logger.error(msg) : res.statusCode >= 400 ? logger.warn(msg) : logger.info(msg);
  });
  next();
});
app.use(cors());
app.use(express.json({ limit: '10mb' })); // photos as base64 are big
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // show saved proof images
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); // read HTML form data
// admin login is kept in a session cookie
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", maxAge: 2 * 60 * 60 * 1000 }, // 2 hours
}));
app.use("/api/auth/login", loginLimiter);
app.use("/admin/login", loginLimiter);
app.use("/api/assistant", aiLimiter);
app.use("/api/fee", feeRou);
app.use("/api/auth", authRou);
app.use("/api/deliveries", deliveriesRou);
app.use("/api/couriers", couriersRou);
app.use("/api/delivery-types", deliveryTypesRou);
app.use("/api/zones", zonesRou);
app.use("/api/assistant", assistantRou);
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

// online: serve the built React app; any non-API page → index.html (React Router handles it)
const reactBuild = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(reactBuild)) {
  app.use(express.static(reactBuild));
  app.use((req, res, next) => {
    const isBackend = ["/api", "/admin", "/uploads"].some((p) => req.path.startsWith(p));
    if (req.method === "GET" && !isBackend) {
      return res.sendFile(path.join(reactBuild, "index.html"));
    }
    next();
  });
}

// unknown route → 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// any error no route caught → log it, never show the stack to users
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} : ${err.stack || err.message}`);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});