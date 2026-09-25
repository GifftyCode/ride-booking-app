const express = require("express");
const cors = require("cors");

const authRoutes = require("../routes/auth.routes");
const rideRoutes = require("../routes/ride.routes");
const ratingRoutes = require("../routes/rating.routes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/rides", rideRoutes);
  app.use("/api/ratings", ratingRoutes);

  app.get("/health", (req, res) => res.json({ ok: true }));

  return app;
}

module.exports = { createApp };
