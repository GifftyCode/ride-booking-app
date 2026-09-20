const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Ride = require("../../models/Ride");
const { requireAuth, requireRole } = require("../../middleware/auth.middleware");

/**
 * Rides Monitoring & Analytics — owned by Richard.
 * Live view of all rides + the analytics dashboard.
 */
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/rides - all rides, optionally filtered by status (live monitor)
router.get("/rides", async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const rides = await Ride.find(filter)
    .populate("rider", "name email")
    .populate("driver", "name email")
    .sort({ createdAt: -1 });
  res.json({ rides });
});

// GET /api/admin/rides/active - just the currently in-flight rides
router.get("/rides/active", async (req, res) => {
  const rides = await Ride.find({
    status: { $in: ["accepted", "driver_arriving", "in_progress"] },
  })
    .populate("rider", "name")
    .populate("driver", "name");
  res.json({ rides });
});

// GET /api/admin/analytics - dashboard summary numbers
router.get("/analytics", async (req, res) => {
  const [totalRides, completedRides, cancelledRides, activeDrivers, totalRiders] = await Promise.all([
    Ride.countDocuments(),
    Ride.countDocuments({ status: "completed" }),
    Ride.countDocuments({ status: "cancelled" }),
    User.countDocuments({ role: "driver", "driverProfile.isOnline": true }),
    User.countDocuments({ role: "rider" }),
  ]);

  res.json({
    totalRides,
    completedRides,
    cancelledRides,
    cancellationRate: totalRides ? (cancelledRides / totalRides) : 0,
    activeDrivers,
    totalRiders,
  });
});

module.exports = router;
