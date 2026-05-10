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
app.use(cors());


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
  createProxyMiddleware(
    proxyConfig(
      'http://127.0.0.1:3001',
      'auth-service'
    )
  )
);

app.use(
  '/api/parks',
  createProxyMiddleware(
    proxyConfig(
      'http://127.0.0.1:3002',
      'parks-service'
    )
  )
);

app.use(
  '/api/reservations',
  createProxyMiddleware(
    proxyConfig(
      'http://127.0.0.1:3003',
      'reservation-service'
    )
  )
);

app.use((req, res) => {

  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada en gateway',
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
});