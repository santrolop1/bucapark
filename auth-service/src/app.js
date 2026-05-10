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

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((envVar) => !process.env[envVar]);

if (missingEnv.length > 0) {
  console.error("[ERROR] Faltan variables en .env: " + missingEnv.join(", "));
  process.exit(1);
}

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    service: "auth-service",
    status: "OK",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint no encontrado",
  });
});

const startServer = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log("[INFO] Auth Service iniciado en puerto " + PORT);
    console.log("[INFO] Health check: http://localhost:" + PORT + "/health");
  });
};

startServer();
