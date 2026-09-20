require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const { initSockets } = require("./sockets");

const authRoutes = require("./routes/auth.routes");
const rideRoutes = require("./routes/ride.routes");
const adminCustomerRoutes = require("./routes/admin/customers.routes"); // Oluwakemi
const adminDriverRoutes = require("./routes/admin/drivers.routes"); // Gideon
const adminRidesAnalyticsRoutes = require("./routes/admin/rides-analytics.routes"); // Richard

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/admin", adminCustomerRoutes);
app.use("/api/admin", adminDriverRoutes);
app.use("/api/admin", adminRidesAnalyticsRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);
initSockets(httpServer);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
