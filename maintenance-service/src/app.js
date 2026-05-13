const dns = require('dns');

dns.setServers([
  '8.8.8.8',
  '8.8.4.4',
  '1.1.1.1'
]);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const connectDB =
  require('./config/database');

const maintenanceRoutes =
  require('./routes/maintenance');

const app = express();

const PORT = process.env.PORT || 3006;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {

  const dbStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";

  res.json({
    service: 'maintenance-service',
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use(
  '/api/maintenance',
  maintenanceRoutes
);

app.use((req, res) => {

  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[MAINTENANCE] Servicio iniciado — puerto ${PORT}`);
      console.log(`[MAINTENANCE] Rutas: GET /api/maintenance | POST /api/maintenance`);
    });
  } catch (err) {
    console.error('[MAINTENANCE] Error en startup:', err.message);
    process.exit(1);
  }
};

startServer();