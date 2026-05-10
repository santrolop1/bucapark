require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Proxy manual con http.request
const proxyTo = (host, port, name) => {
  return (req, res) => {
    console.log('[PROXY] ' + name + ': ' + req.method + ' ' + req.path);
    
    const options = {
      hostname: host,
      port: port,
      path: req.originalUrl,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        res.setHeader(key, value);
      }
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[PROXY ERROR] ' + name + ': ' + err.message);
      res.status(502).json({ success: false, error: name + ' no disponible' });
    });

    req.pipe(proxyReq);
  };
};

// Rutas de proxy (Express v5 compatible con regex)
app.all(/^\/api\/auth\/.*$/, proxyTo('127.0.0.1', 3001, 'auth-service'));
app.all(/^\/api\/parks\/.*$/, proxyTo('127.0.0.1', 3002, 'parks-service'));
app.all(/^\/api\/reservations\/.*$/, proxyTo('127.0.0.1', 3003, 'reservation-service'));

// Health check
app.get('/health', (req, res) => {
  res.json({ gateway: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('Gateway en puerto ' + PORT);
  console.log('Proxy /api/auth -> 127.0.0.1:3001');
});
