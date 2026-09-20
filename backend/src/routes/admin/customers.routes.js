const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Ride = require("../../models/Ride");
const { requireAuth, requireRole } = require("../../middleware/auth.middleware");

/**
 * Customer (Rider) Management — owned by Oluwakemi.
 * Everything to do with viewing/managing riders as admin.
 */
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/customers - list all riders, with optional search
router.get("/customers", async (req, res) => {
  const filter = { role: "rider" };
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, "i") },
      { email: new RegExp(req.query.search, "i") },
    ];
  }
  const customers = await User.find(filter).select("-passwordHash");
  res.json({ customers });
});

// GET /api/admin/customers/:id - single rider profile + their ride history
router.get("/customers/:id", async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: "rider" }).select("-passwordHash");
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const rides = await Ride.find({ rider: customer._id }).sort({ createdAt: -1 });
  res.json({ customer, rides });
});

// PATCH /api/admin/customers/:id/suspend - suspend/reinstate a rider account
router.patch("/customers/:id/suspend", async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: "rider" });
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  customer.isSuspended = req.body.suspended !== false; // defaults to true
  await customer.save();
  res.json({ customer });
});

module.exports = router;
