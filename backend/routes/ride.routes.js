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
  updateRideStatus,
  transitionRide,
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

// GET /api/rides/history - authenticated rider's paginated history.
// The existing /history/mine alias remains available for existing clients.
router.get("/history", requireAuth, getMyRideHistory);
router.get("/history/mine", requireAuth, getMyRideHistory);

// GET /api/rides/:id - either party views ride status
router.get("/:id", requireAuth, asyncHandler(getRide));

// PATCH /api/rides/:id/accept - Driver accepts a requested ride
router.patch("/:id/accept", requireAuth, requireRole("driver"), asyncHandler(acceptRide));

// Explicit lifecycle actions used by the tracking pages.
router.patch("/:id/arrive", requireAuth, requireRole("driver"), (req, res) => transitionRide(req, res, "arrived"));
router.patch("/:id/start", requireAuth, requireRole("driver"), (req, res) => transitionRide(req, res, "in_progress"));
router.patch("/:id/complete", requireAuth, requireRole("driver"), (req, res) => transitionRide(req, res, "completed"));

// PATCH /api/rides/:id/status  { status: "arrived" | "in_progress" | "completed" }
router.patch("/:id/status", requireAuth, requireRole("driver"), updateRideStatus);

// PATCH /api/rides/:id/cancel - either rider or driver
router.patch("/:id/cancel", requireAuth, asyncHandler(cancelRide));

module.exports = router;
