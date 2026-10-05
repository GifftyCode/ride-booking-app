const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const asyncHandler = require("../services/asyncHandler");
const {
  createRide,
  estimateRide,
  getCurrentRide,
  getRide,
  getAvailableRides,
  getCurrentRiderRide,
  acceptRide,
  markRideArrived,
  startRide,
  completeRide,
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

// POST /api/rides/estimate - rider gets fare estimate
router.post("/estimate",requireAuth,requireRole("rider"),asyncHandler(estimateRide));

// POST /api/rides - rider creates a ride request
router.post("/",requireAuth,requireRole("rider"),asyncHandler(createRide));

// GET /api/rides/current - rider gets current active ride
router.get("/current",requireAuth,requireRole("rider"),asyncHandler(getCurrentRiderRide));

// GET /api/rides/available - available requests for drivers
router.get("/available",requireAuth,requireRole("driver"),asyncHandler(getAvailableRides));

// GET /api/rides/history/mine - rider or driver's past rides
router.get("/history/mine", requireAuth, asyncHandler(getMyRideHistory));

// GET /api/rides/:id - either party views ride status
router.get("/:id", requireAuth, asyncHandler(getRide));

// PATCH /api/rides/:id/accept - Driver accepts a requested ride
router.patch("/:id/accept", requireAuth, requireRole("driver"), asyncHandler(acceptRide));

// PATCH /api/rides/:id/arrive - assigned driver marks arrival
router.patch("/:id/arrive",requireAuth,requireRole("driver"),asyncHandler(markRideArrived));

// PATCH /api/rides/:id/start - assigned driver starts trip
router.patch("/:id/start",requireAuth,requireRole("driver"),asyncHandler(startRide));

// PATCH /api/rides/:id/complete - assigned driver completes trip
router.patch("/:id/complete",requireAuth,requireRole("driver"),asyncHandler(completeRide));

// PATCH /api/rides/:id/cancel - either rider or driver
router.patch("/:id/cancel", requireAuth, asyncHandler(cancelRide));

module.exports = router;
