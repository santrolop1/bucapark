require("dotenv").config();

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

const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: "Base de datos no disponible",
    });
  }

  next();
};

// ── Rutas ────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// POST /api/auth/login
// GET  /api/auth/me
app.use("/api/auth", requireDatabase, authRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint no encontrado" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const connectWithRetry = async () => {
  try {
    await connectDatabase();
  } catch (err) {
    console.error("[AUTH] MongoDB no disponible, reintentando en 10s:", err.message);
    setTimeout(connectWithRetry, 10000);
  }
};

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`[AUTH] Servicio iniciado - puerto ${PORT}`);
    console.log("[AUTH] Rutas: POST /api/auth/register | POST /api/auth/login | GET /api/auth/me");
  });

  connectWithRetry();
};

startServer();
