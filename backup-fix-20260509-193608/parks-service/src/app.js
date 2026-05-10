require("dotenv").config();

const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
  "1.1.1.1",
]);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const connectDatabase = require(
  "./config/database"
);

const parksRoutes = require("./routes/parks");

const app = express();

const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/parks", parksRoutes);

app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected";

  res.status(200).json({
    service: "parks-service",
    status: "OK",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `[OK] Parks Service corriendo en puerto ${PORT}`
    );
  });
};

startServer();