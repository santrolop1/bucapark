require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");
const mongoose = require("mongoose");

const connectDatabase = require("./config/database");
const authRoutes = require("./routes/auth");

const app = express();

const PORT = process.env.PORT || 3001;

/*
|--------------------------------------------------------------------------
| Verificar variables de entorno
|--------------------------------------------------------------------------
*/

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];

const missingEnv = requiredEnv.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnv.length > 0) {
  console.error(
    `[ERROR] Faltan variables en .env: ${missingEnv.join(", ")}`
  );

  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| Middlewares
|--------------------------------------------------------------------------
*/

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));

// ── Health check — va ANTES de las rutas para no ser bloqueado ────────────────
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";

  res.json({
    service:   "auth-service",
    status:    "OK",
    database:  mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// POST /api/auth/login
// GET  /api/auth/me
app.use("/api/auth", authRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint no encontrado" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`[AUTH] Servicio iniciado — puerto ${PORT}`);
      console.log(`[AUTH] Rutas: POST /api/auth/register | POST /api/auth/login | GET /api/auth/me`);
    });
  } catch (err) {
    console.error("[AUTH] Error en startup:", err.message);
    process.exit(1);
  }
};

startServer();