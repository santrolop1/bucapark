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

const inventoryRoutes =
  require('./routes/inventory');

const app = express();

const PORT = process.env.PORT || 3007;

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
    service: 'inventory-service',
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use(
  '/api/inventory',
  inventoryRoutes
);

app.use((req, res) => {

  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
});

const connectWithRetry = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[INVENTORY] MongoDB no disponible, reintentando en 10s:', err.message);
    setTimeout(connectWithRetry, 10000);
  }
};

app.listen(PORT, () => {
  console.log(`[INVENTORY] Servicio iniciado — puerto ${PORT}`);
  console.log(`[INVENTORY] Rutas: GET /api/inventory | POST /api/inventory`);
  connectWithRetry();
});