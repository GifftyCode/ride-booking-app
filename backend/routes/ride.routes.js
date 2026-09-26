const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const {
  createRide,
  getRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getMyRideHistory,
} = require("../controllers/ride.controller");

/**
 * Ownership map (see docs/architecture.md):
 * - Rider teammate builds out: POST / (request ride), cancel, ratings
 * - Driver teammate builds out: accept, status updates, location push
 * - Admin teammate builds out: /api/admin/* (separate file) reading from this same Ride model
 * Everyone shares: the model, the state machine, and this file's transition logic.
 */

// POST /api/rides - Rider creates a ride request
router.post("/", requireAuth, requireRole("rider"), createRide);

// GET /api/rides/history/mine - rider or driver's past rides
router.get("/history/mine", requireAuth, getMyRideHistory);

// GET /api/rides/:id - either party views ride status
router.get("/:id", requireAuth, getRide);

// PATCH /api/rides/:id/accept - Driver accepts a requested ride
router.patch("/:id/accept", requireAuth, requireRole("driver"), acceptRide);

// PATCH /api/rides/:id/status  { status: "arrived" | "in_progress" | "completed" }
router.patch("/:id/status", requireAuth, requireRole("driver"), updateRideStatus);

// PATCH /api/rides/:id/cancel - either rider or driver
router.patch("/:id/cancel", requireAuth, cancelRide);

module.exports = router;
