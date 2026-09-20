const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Ride = require("../models/Ride");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// All admin routes require an authenticated admin
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/rides - all rides, optionally filtered by status
router.get("/rides", async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const rides = await Ride.find(filter)
    .populate("rider", "name email")
    .populate("driver", "name email")
    .sort({ createdAt: -1 });
  res.json({ rides });
});

// GET /api/admin/users?role=driver - manage riders/drivers
router.get("/users", async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  const users = await User.find(filter).select("-passwordHash");
  res.json({ users });
});

// PATCH /api/admin/drivers/:id/verify - approve a driver's documents
router.patch("/drivers/:id/verify", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "driver") return res.status(404).json({ error: "Driver not found" });
  user.driverProfile.isVerified = true;
  await user.save();
  res.json({ user });
});

// GET /api/admin/analytics - basic counts for the dashboard
router.get("/analytics", async (req, res) => {
  const [totalRides, completedRides, cancelledRides, activeDrivers] = await Promise.all([
    Ride.countDocuments(),
    Ride.countDocuments({ status: "completed" }),
    Ride.countDocuments({ status: "cancelled" }),
    User.countDocuments({ role: "driver", "driverProfile.isOnline": true }),
  ]);
  res.json({ totalRides, completedRides, cancelledRides, activeDrivers });
});

module.exports = router;
