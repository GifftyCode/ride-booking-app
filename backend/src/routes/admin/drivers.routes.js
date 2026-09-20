const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Ride = require("../../models/Ride");
const { requireAuth, requireRole } = require("../../middleware/auth.middleware");

/**
 * Driver Management & Verification — owned by Gideon.
 * Everything to do with viewing/verifying/managing drivers as admin.
 */
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/drivers - list all drivers, optional filters
router.get("/drivers", async (req, res) => {
  const filter = { role: "driver" };
  if (req.query.verified !== undefined) {
    filter["driverProfile.isVerified"] = req.query.verified === "true";
  }
  if (req.query.online !== undefined) {
    filter["driverProfile.isOnline"] = req.query.online === "true";
  }
  const drivers = await User.find(filter).select("-passwordHash");
  res.json({ drivers });
});

// GET /api/admin/drivers/pending-verification - queue of unverified drivers
router.get("/drivers/pending-verification", async (req, res) => {
  const drivers = await User.find({
    role: "driver",
    "driverProfile.isVerified": false,
  }).select("-passwordHash");
  res.json({ drivers });
});

// GET /api/admin/drivers/:id - single driver profile + their trip history
router.get("/drivers/:id", async (req, res) => {
  const driver = await User.findOne({ _id: req.params.id, role: "driver" }).select("-passwordHash");
  if (!driver) return res.status(404).json({ error: "Driver not found" });

  const rides = await Ride.find({ driver: driver._id }).sort({ createdAt: -1 });
  res.json({ driver, rides });
});

// PATCH /api/admin/drivers/:id/verify - approve a driver's documents
router.patch("/drivers/:id/verify", async (req, res) => {
  const driver = await User.findOne({ _id: req.params.id, role: "driver" });
  if (!driver) return res.status(404).json({ error: "Driver not found" });

  driver.driverProfile.isVerified = true;
  await driver.save();
  res.json({ driver });
});

// PATCH /api/admin/drivers/:id/suspend - suspend/reinstate a driver account
router.patch("/drivers/:id/suspend", async (req, res) => {
  const driver = await User.findOne({ _id: req.params.id, role: "driver" });
  if (!driver) return res.status(404).json({ error: "Driver not found" });

  driver.isSuspended = req.body.suspended !== false;
  await driver.save();
  res.json({ driver });
});

module.exports = router;
