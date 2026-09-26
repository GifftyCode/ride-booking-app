const Ride = require("../models/Ride");
const { applyTransition } = require("../services/rideStateMachine");
const { calculateFareEstimate } = require("../services/pricingEngine");
const { findAvailableDrivers } = require("../services/matchingEngine");
const { notifyRideRequested, notifyRideStatusChanged } = require("../services/notificationService");

async function createRide(req, res) {
  try {
    const { pickup, destination, distanceInKm = 0, estimatedFare } = req.body;
    const estimate = estimatedFare ?? calculateFareEstimate({ distanceKm: distanceInKm }).fareEstimate;

    const ride = await Ride.create({
      riderId: req.user.id,
      pickup,
      destination,
      distanceInKm,
      estimatedFare: estimate,
    });

    const drivers = await findAvailableDrivers({ pickup });
    notifyRideRequested({ ride, drivers });

    res.status(201).json({ ride, matching: { nearbyDrivers: drivers.length } });
  } catch (err) {
    res.status(500).json({ error: "Could not create ride", details: err.message });
  }
}

async function getRide(req, res) {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ error: "Ride not found" });
  res.json({ ride });
}

async function acceptRide(req, res) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    ride.driverId = req.user.id;
    applyTransition(ride, "accepted");
    await ride.save();

    notifyRideStatusChanged({ ride });
    res.json({ ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateRideStatus(req, res) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    applyTransition(ride, req.body.status);
    await ride.save();

    notifyRideStatusChanged({ ride });
    res.json({ ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function cancelRide(req, res) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: "Ride not found" });

    applyTransition(ride, req.user.role === "driver" ? "cancelled_by_driver" : "cancelled_by_rider");
    ride.cancellationReason = req.body.reason;
    await ride.save();

    notifyRideStatusChanged({ ride });
    res.json({ ride });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getMyRideHistory(req, res) {
  const filter = req.user.role === "driver" ? { driverId: req.user.id } : { riderId: req.user.id };
  const rides = await Ride.find(filter).sort({ createdAt: -1 });
  res.json({ rides });
}

module.exports = {
  createRide,
  getRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getMyRideHistory,
};
