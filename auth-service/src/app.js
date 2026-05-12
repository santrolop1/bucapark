require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
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

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";

  res.status(200).json({
    service: "auth-service",
    status: "OK",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint no encontrado",
  });
});

/*
|--------------------------------------------------------------------------
| Inicializar servidor
|--------------------------------------------------------------------------
*/

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `[OK] Auth Service corriendo en http://localhost:${PORT}`
    );

    console.log(
      `[OK] Health check: http://localhost:${PORT}/health`
    );
  });
};

startServer();