require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const mongoose = require("mongoose");

const connectDatabase    = require("./config/database");
const reservationRoutes  = require("./routes/reservations");

const app  = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));

// ── Health — va ANTES de las rutas ───────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    service:   "reservation-service",
    status:    "OK",
    database:  mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
// POST   /api/reservations         crear reserva (auth)
// GET    /api/reservations         todas las reservas (admin)
// GET    /api/reservations/my      mis reservas (auth)
// PATCH  /api/reservations/:id/approve  aprobar (admin)
// PATCH  /api/reservations/:id/reject   rechazar (admin)
// DELETE /api/reservations/:id    cancelar (auth)
app.use('/api/reservations', reservationRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint no encontrado" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`[RESERVATIONS] Servicio iniciado — puerto ${PORT}`);
      console.log(`[RESERVATIONS] Rutas: POST /api/reservations | GET /api/reservations/my`);
    });
  } catch (err) {
    console.error("[RESERVATIONS] Error en startup:", err.message);
    process.exit(1);
  }
};

startServer();
