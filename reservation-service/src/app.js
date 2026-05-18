const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const connectDB = require('./config/database');
const reservationRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    service: 'reservation-service',
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/reservations', reservationRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`reservation-service corriendo en puerto ${PORT}`);
  });
};

startServer();
