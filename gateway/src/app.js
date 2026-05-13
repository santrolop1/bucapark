require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const {
  createProxyMiddleware,
} = require('http-proxy-middleware');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(helmet());
// CORS_ORIGIN en producción: ej. "https://bucapark.vercel.app"
// Sin CORS_ORIGIN (desarrollo local): acepta todos los orígenes
app.use(cors(
  process.env.CORS_ORIGIN
    ? { origin: process.env.CORS_ORIGIN.split(',').map(s => s.trim()) }
    : {}
));
app.use(express.json());

app.get('/health', (req, res) => {

  res.json({
    service: 'gateway',
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

const proxyConfig = (
  target,
  name
) => ({

  target,

  changeOrigin: true,

  proxyTimeout: 10000,

  timeout: 10000,

  onProxyReq: (
    proxyReq,
    req
  ) => {

    console.log(
      `[PROXY] ${name}: ${req.method} ${req.originalUrl}`
    );

    if (
      req.body &&
      Object.keys(req.body).length
    ) {

      const bodyData =
        JSON.stringify(req.body);

      proxyReq.setHeader(
        'Content-Type',
        'application/json'
      );

      proxyReq.setHeader(
        'Content-Length',
        Buffer.byteLength(bodyData)
      );

      proxyReq.write(bodyData);
    }
  },

  onError: (
    err,
    req,
    res
  ) => {

    console.error(
      `[PROXY ERROR] ${name}:`,
      err.message
    );

    if (!res.headersSent) {

      res.status(502).json({

        success: false,

        error:
          `${name} no disponible`,
      });
    }
  },
});

app.use(
  '/api/auth',
  createProxyMiddleware({

    ...proxyConfig(
      process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:3001',
      'auth-service'
    ),

    pathRewrite: (path) => `/api/auth${path === '/' ? '' : path}`,
  })
);

app.use(
  '/api/parks',
  createProxyMiddleware({

    ...proxyConfig(
      process.env.PARKS_SERVICE_URL || 'http://127.0.0.1:3002',
      'parks-service'
    ),

    pathRewrite: (path) => `/api/parks${path === '/' ? '' : path}`,
  })
);

app.use(
  '/api/reservations',
  createProxyMiddleware({

    ...proxyConfig(
      process.env.RESERVATION_SERVICE_URL || 'http://127.0.0.1:3003',
      'reservation-service'
    ),

    pathRewrite: (path) => `/api/reservations${path === '/' ? '' : path}`,
  })
);

app.use(
  '/api/events',
  createProxyMiddleware({

    ...proxyConfig(
      process.env.EVENTS_SERVICE_URL || 'http://127.0.0.1:3004',
      'events-service'
    ),

    pathRewrite: (path) => `/api/events${path === '/' ? '' : path}`,
  })
);

app.use(
  '/api/incidents',
  createProxyMiddleware({

    ...proxyConfig(
      process.env.INCIDENTS_SERVICE_URL || 'http://127.0.0.1:3005',
      'incidents-service'
    ),

    pathRewrite: (path) => `/api/incidents${path === '/' ? '' : path}`,
  })
);

app.use(
  '/api/maintenance',
  createProxyMiddleware({

    ...proxyConfig(
      process.env.MAINTENANCE_SERVICE_URL || 'http://127.0.0.1:3006',
      'maintenance-service'
    ),

    pathRewrite: (path) => `/api/maintenance${path === '/' ? '' : path}`,
  })
);

app.use(
  '/api/inventory',
  createProxyMiddleware({

    ...proxyConfig(
      process.env.INVENTORY_SERVICE_URL || 'http://127.0.0.1:3007',
      'inventory-service'
    ),

    pathRewrite: (path) => `/api/inventory${path === '/' ? '' : path}`,
  })
);

app.use((req, res) => {

  res.status(404).json({

    success: false,

    error:
      'Ruta no encontrada en gateway',
  });
});

app.listen(PORT, () => {

  console.log(
    `Gateway en puerto ${PORT}`
  );

  console.log(
    `Proxy /api/auth -> ${process.env.AUTH_SERVICE_URL}`
  );

  console.log(
    `Proxy /api/parks -> ${process.env.PARKS_SERVICE_URL}`
  );

  console.log(
    `Proxy /api/reservations -> ${process.env.RESERVATION_SERVICE_URL}`
  );

  console.log(
    `Proxy /api/events -> ${process.env.EVENTS_SERVICE_URL}`
  );

  console.log(
    `Proxy /api/incidents -> ${process.env.INCIDENTS_SERVICE_URL}`
  );

  console.log(
    `Proxy /api/maintenance -> ${process.env.MAINTENANCE_SERVICE_URL}`
  );

  console.log(
    `Proxy /api/inventory -> ${process.env.INVENTORY_SERVICE_URL}`
  );
});