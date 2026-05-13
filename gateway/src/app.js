require('dotenv').config();

const https = require('https');
const http  = require('http');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Mapa de servicios ────────────────────────────────────────────────────────
// Centraliza nombres, rutas y targets para evitar repetición.
const SERVICES = {
  auth:        { prefix: '/api/auth',        url: process.env.AUTH_SERVICE_URL        || 'http://127.0.0.1:3001', name: 'auth-service' },
  parks:       { prefix: '/api/parks',       url: process.env.PARKS_SERVICE_URL       || 'http://127.0.0.1:3002', name: 'parks-service' },
  reservations:{ prefix: '/api/reservations',url: process.env.RESERVATION_SERVICE_URL || 'http://127.0.0.1:3003', name: 'reservation-service' },
  events:      { prefix: '/api/events',      url: process.env.EVENTS_SERVICE_URL      || 'http://127.0.0.1:3004', name: 'events-service' },
  incidents:   { prefix: '/api/incidents',   url: process.env.INCIDENTS_SERVICE_URL   || 'http://127.0.0.1:3005', name: 'incidents-service' },
  maintenance: { prefix: '/api/maintenance', url: process.env.MAINTENANCE_SERVICE_URL || 'http://127.0.0.1:3006', name: 'maintenance-service' },
  inventory:   { prefix: '/api/inventory',   url: process.env.INVENTORY_SERVICE_URL   || 'http://127.0.0.1:3007', name: 'inventory-service' },
};

// ── Middlewares globales ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(
  process.env.CORS_ORIGIN
    ? { origin: process.env.CORS_ORIGIN.split(',').map(s => s.trim()) }
    : {}
));
app.use(express.json());
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));

// ── Helpers ──────────────────────────────────────────────────────────────────

// Construye el proxy handler para un servicio.
// pathRewrite reconstruye la ruta completa porque http-proxy-middleware v4
// ya strip el prefijo cuando está montado con app.use('/prefix', ...).
const makeProxy = ({ url, name, prefix }) => createProxyMiddleware({
  target:       url,
  changeOrigin: true,
  proxyTimeout: 15000,
  timeout:      15000,

  pathRewrite: (path) => `${prefix}${path === '/' ? '' : path}`,

  on: {
    proxyReq: (proxyReq, req) => {
      // Reenvía el body en requests con payload
      if (req.body && Object.keys(req.body).length) {
        const body = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type',   'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
        proxyReq.write(body);
      }
      console.log(`[PROXY →] ${name}: ${req.method} ${req.originalUrl} → ${url}${prefix}${req.path}`);
    },

    proxyRes: (proxyRes, req) => {
      const status = proxyRes.statusCode;
      if (status >= 500) {
        console.error(`[PROXY ✗] ${name}: ${req.method} ${req.originalUrl} ← ${status} (error upstream)`);
      } else if (status >= 400) {
        // 404 con content-type text/plain = Render devuelve "no-server" (servicio no desplegado)
        const ct = proxyRes.headers['content-type'] || '';
        if (status === 404 && ct.includes('text/plain')) {
          console.error(`[PROXY ✗] ${name}: upstream devuelve 404 text/plain — el servicio probablemente NO está desplegado en Render`);
        } else {
          console.warn(`[PROXY ⚠] ${name}: ${req.method} ${req.originalUrl} ← ${status}`);
        }
      }
    },

    error: (err, req, res) => {
      console.error(`[PROXY ✗] ${name}: ${err.code || err.message} — target: ${url}`);

      if (err.code === 'ECONNREFUSED') {
        console.error(`           → El servicio NO está corriendo en ${url}`);
      } else if (err.code === 'ENOTFOUND') {
        console.error(`           → DNS falló para ${url} — verificá la variable de entorno`);
      } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
        console.error(`           → Timeout conectando a ${url}`);
      }

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error:   `${name} no disponible`,
          detail:  err.code || err.message,
        });
      }
    },
  },
});

// ── Health del gateway ───────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ service: 'gateway', status: 'OK', timestamp: new Date().toISOString() });
});

// ── Status de todos los servicios upstream ───────────────────────────────────
// Llama al /health de cada microservicio y devuelve un resumen.
app.get('/api/status', async (_req, res) => {
  const ping = (svc) => new Promise((resolve) => {
    const target = `${svc.url}/health`;
    const mod    = target.startsWith('https') ? https : http;
    const timer  = setTimeout(() => resolve({ name: svc.name, target: svc.url, status: 'timeout' }), 4000);

    try {
      const req = mod.get(target, (r) => {
        clearTimeout(timer);
        let raw = '';
        r.on('data', (c) => { raw += c; });
        r.on('end', () => {
          try {
            const body = JSON.parse(raw);
            resolve({
              name:     svc.name,
              target:   svc.url,
              status:   r.statusCode === 200 ? 'ok' : 'error',
              httpCode: r.statusCode,
              db:       body.database || undefined,
            });
          } catch {
            resolve({ name: svc.name, target: svc.url, status: r.statusCode === 200 ? 'ok' : 'error', httpCode: r.statusCode });
          }
        });
      });
      req.on('error', (err) => {
        clearTimeout(timer);
        resolve({ name: svc.name, target: svc.url, status: 'down', error: err.code || err.message });
      });
      req.setTimeout(4000, () => { req.destroy(); });
    } catch (err) {
      clearTimeout(timer);
      resolve({ name: svc.name, target: svc.url, status: 'down', error: err.message });
    }
  });

  const results = await Promise.all(Object.values(SERVICES).map(ping));
  const allOk   = results.every(r => r.status === 'ok');

  res.status(allOk ? 200 : 207).json({
    gateway:   'ok',
    timestamp: new Date().toISOString(),
    services:  results,
  });
});

// ── Proxies ──────────────────────────────────────────────────────────────────
Object.values(SERVICES).forEach(svc => {
  app.use(svc.prefix, makeProxy(svc));
});

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada en gateway' });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n=== GATEWAY iniciado en puerto ${PORT} ===`);
  Object.values(SERVICES).forEach(({ name, prefix, url }) => {
    const configured = url.includes('127.0.0.1') ? '⚠ LOCAL (env var no seteada)' : '✓ REMOTO';
    console.log(`  ${prefix.padEnd(22)} → ${url}  [${name}] ${configured}`);
  });
  console.log('');
});
