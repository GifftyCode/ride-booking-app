const express = require("express");
const router = express.Router();
const Ride = require("../models/Ride");
const { applyTransition } = require("../services/rideStateMachine");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { broadcastRideUpdate } = require("../sockets");

/**
 * Ownership map (see docs/architecture.md):
 * - Rider teammate builds out: POST / (request ride), cancel, ratings
 * - Driver teammate builds out: accept, status updates, location push
 * - Admin teammate builds out: /api/admin/* (separate file) reading from this same Ride model
 * Everyone shares: the model, the state machine, and this file's transition logic.
 */

// POST /api/rides - Rider creates a ride request
router.post("/", requireAuth, requireRole("rider"), async (req, res) => {
  try {
    const { pickup, dropoff, fareEstimate } = req.body;
    const ride = await Ride.create({
      rider: req.user.id,
      pickup,
      dropoff,
      fareEstimate,
    });
    // TODO (Rider owner): trigger matching engine to notify nearby drivers
    res.status(201).json({ ride });
  } catch (err) {
    res.status(500).json({ error: "Could not create ride", details: err.message });
  }
});

// GET /api/rides/:id - either party views ride status
router.get("/:id", requireAuth, async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ error: "Ride not found" });
  res.json({ ride });
});

// PATCH /api/rides/:id/accept - Driver accepts a requested ride
router.patch("/:id/accept", requireAuth, requireRole("driver"), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    ride.driver = req.user.id;
    applyTransition(ride, "accepted");
    await ride.save();

    broadcastRideUpdate(ride);
    res.json({ ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/rides/:id/status  { status: "driver_arriving" | "in_progress" | "completed" }
router.patch("/:id/status", requireAuth, requireRole("driver"), async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    applyTransition(ride, req.body.status);
    await ride.save();

    broadcastRideUpdate(ride);
    res.json({ ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/rides/:id/cancel - either rider or driver
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    applyTransition(ride, "cancelled");
    ride.cancelledBy = req.user.role;
    ride.cancelReason = req.body.reason;
    await ride.save();

    broadcastRideUpdate(ride);
    res.json({ ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/rides/history/mine - rider or driver's past rides
router.get("/history/mine", requireAuth, async (req, res) => {
  const filter =
    req.user.role === "driver" ? { driver: req.user.id } : { rider: req.user.id };
  const rides = await Ride.find(filter).sort({ createdAt: -1 });
  res.json({ rides });
});

module.exports = router;
