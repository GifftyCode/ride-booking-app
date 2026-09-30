const Ride = require("../models/Ride");
const { applyTransition } = require("../services/rideStateMachine");
const { calculateFareEstimate, calculateDistanceKm } = require("../services/pricingEngine");
const { findAvailableDrivers } = require("../services/matchingEngine");
const { notifyRideRequested, notifyRideStatusChanged } = require("../services/notificationService");

function validateLocation(location) {
  return location && typeof location.address === "string" && location.address.trim() &&
    Number.isFinite(Number(location.latitude)) && Number(location.latitude) >= -90 && Number(location.latitude) <= 90 &&
    Number.isFinite(Number(location.longitude)) && Number(location.longitude) >= -180 && Number(location.longitude) <= 180;
}

const activeStatuses = ["requested", "accepted", "arrived", "in_progress"];

async function estimateRide(req, res) {
  const { pickup, destination } = req.body;
  if (!validateLocation(pickup) || !validateLocation(destination)) return res.status(400).json({ error: "Valid pickup and destination addresses and coordinates are required" });
  if (Number(pickup.latitude) === Number(destination.latitude) && Number(pickup.longitude) === Number(destination.longitude)) return res.status(400).json({ error: "Pickup and destination must be different" });
  const distanceInKm = calculateDistanceKm(pickup, destination);
  const estimate = calculateFareEstimate({ distanceKm: distanceInKm });
  res.json({ distanceInKm: Number(distanceInKm.toFixed(2)), estimatedFare: estimate.fareEstimate, currency: estimate.currency, breakdown: estimate.breakdown });
}

async function getCurrentRide(req, res) {
  const ride = await Ride.findOne({ riderId: req.user.id, status: { $in: activeStatuses } }).sort({ requestedAt: -1 });
  res.json({ ride: ride || null });
}

async function createRide(req, res) {
  try {
    const { pickup, destination } = req.body;
    if (!validateLocation(pickup) || !validateLocation(destination)) return res.status(400).json({ error: "Valid pickup and destination addresses and coordinates are required" });
    if (Number(pickup.latitude) === Number(destination.latitude) && Number(pickup.longitude) === Number(destination.longitude)) return res.status(400).json({ error: "Pickup and destination must be different" });
    if (await Ride.exists({ riderId: req.user.id, status: { $in: activeStatuses } })) return res.status(409).json({ error: "You already have an active ride" });
    const distanceInKm = calculateDistanceKm(pickup, destination);
    const estimate = calculateFareEstimate({ distanceKm: distanceInKm }).fareEstimate;

    const ride = await Ride.create({
      riderId: req.user.id,
      pickup,
      destination,
      distanceInKm: Number(distanceInKm.toFixed(2)),
      estimatedFare: estimate,
    });

    const drivers = await findAvailableDrivers({ pickup });
    notifyRideRequested({ ride, drivers });

    res.status(201).json({ ride, matching: { nearbyDrivers: drivers.length } });
  } catch (err) {
    res.status(err.code === 11000 ? 409 : 500).json({ error: err.code === 11000 ? "You already have an active ride" : "Could not create ride" });
  }
}

async function getRide(req, res) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(404).json({ error: "Ride not found" });
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ error: "Ride not found" });
  if (req.user.role === "rider" && String(ride.riderId) !== req.user.id) return res.status(403).json({ error: "You cannot view this ride" });
  if (req.user.role === "driver" && String(ride.driverId) !== req.user.id) return res.status(403).json({ error: "You cannot view this ride" });
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
    if (req.user.role === "rider" && String(ride.riderId) !== req.user.id) return res.status(403).json({ error: "You cannot cancel this ride" });

    applyTransition(ride, req.user.role === "driver" ? "cancelled_by_driver" : "cancelled_by_rider");
    ride.cancellationReason = String(req.body.reason || req.body.cancellationReason || "Cancelled by rider").trim();
    await ride.save();

    notifyRideStatusChanged({ ride });
    res.json({ ride });
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
}

async function getMyRideHistory(req, res) {
  const filter = req.user.role === "driver" ? { driverId: req.user.id } : { riderId: req.user.id };
  const rides = await Ride.find(filter).sort({ createdAt: -1 });
  res.json({ rides });
}

module.exports = {
  createRide,
  estimateRide,
  getCurrentRide,
  getRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getMyRideHistory,
};
