require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const connectDatabase = require('./database');

const authRoutes = require('./modules/auth/routes');
const parksRoutes = require('./modules/parks/routes');
const reservationsRoutes = require('./modules/reservations/routes');
const eventsRoutes = require('./modules/events/routes');
const incidentsRoutes = require('./modules/incidents/routes');
const maintenanceRoutes = require('./modules/maintenance/routes');
const inventoryRoutes = require('./modules/inventory/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Variables de entorno requeridas ───────────────────────────────────────────
const missingEnv = ['MONGO_URI', 'JWT_SECRET'].filter((v) => !process.env[v]);
if (missingEnv.length) {
  console.error(`[ERROR] Faltan variables de entorno: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors(
    corsOrigin && corsOrigin !== '*'
      ? { origin: corsOrigin.split(',').map((s) => s.trim()) }
      : {}
  )
);

app.use(express.json());
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    service: 'bucapark-backend',
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── Guard: espera MongoDB antes de procesar rutas de negocio ─────────────────
const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, error: 'Base de datos no disponible' });
  }
  next();
};

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api/parks', requireDatabase, parksRoutes);
app.use('/api/reservations', requireDatabase, reservationsRoutes);
app.use('/api/events', requireDatabase, eventsRoutes);
app.use('/api/incidents', requireDatabase, incidentsRoutes);
app.use('/api/maintenance', requireDatabase, maintenanceRoutes);
app.use('/api/inventory', requireDatabase, inventoryRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint no encontrado' });
});

// ── Arranque con retry ────────────────────────────────────────────────────────
const connectWithRetry = async () => {
  try {
    await connectDatabase();
  } catch (err) {
    console.error('[APP] MongoDB no disponible, reintentando en 10s:', err.message);
    setTimeout(connectWithRetry, 10000);
  }
};

app.listen(PORT, () => {
  console.log(`\n=== BucaPark Backend iniciado en puerto ${PORT} ===`);
  console.log('  /api/auth         → auth');
  console.log('  /api/parks        → parks');
  console.log('  /api/reservations → reservations');
  console.log('  /api/events       → events');
  console.log('  /api/incidents    → incidents');
  console.log('  /api/maintenance  → maintenance');
  console.log('  /api/inventory    → inventory\n');
});

connectWithRetry();
