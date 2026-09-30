const Ride = require("../models/Ride");
const { applyTransition } = require("../services/rideStateMachine");
const { calculateFareEstimate, calculateDistanceKm } = require("../services/pricingEngine");
const { findAvailableDrivers } = require("../services/matchingEngine");
const { notifyRideRequested, notifyRideStatusChanged } = require("../services/notificationService");
const { sendSuccess } = require("../services/apiResponse");
const { httpError } = require("../services/httpErrors");

function validateLocation(location) {
  return location && typeof location.address === "string" && location.address.trim() &&
    Number.isFinite(Number(location.latitude)) && Number(location.latitude) >= -90 && Number(location.latitude) <= 90 &&
    Number.isFinite(Number(location.longitude)) && Number(location.longitude) >= -180 && Number(location.longitude) <= 180;
}

const activeStatuses = ["requested", "accepted", "arrived", "in_progress"];

async function estimateRide(req, res) {
  const { pickup, destination } = req.body;
  if (!validateLocation(pickup) || !validateLocation(destination)) throw httpError(400, "Valid pickup and destination addresses and coordinates are required");
  if (Number(pickup.latitude) === Number(destination.latitude) && Number(pickup.longitude) === Number(destination.longitude)) throw httpError(400, "Pickup and destination must be different");
  const distanceInKm = calculateDistanceKm(pickup, destination);
  const estimate = calculateFareEstimate({ distanceKm: distanceInKm });
  return sendSuccess(res, "Fare estimate calculated", {
    distanceInKm: Number(distanceInKm.toFixed(2)),
    estimatedFare: estimate.fareEstimate,
    currency: estimate.currency,
    breakdown: estimate.breakdown,
  });
}

async function getCurrentRide(req, res) {
  const ride = await Ride.findOne({ riderId: req.user.id, status: { $in: activeStatuses } }).sort({ requestedAt: -1 });
  return sendSuccess(res, "Current ride retrieved", { ride: ride || null });
}

async function createRide(req, res) {
  const { pickup, destination } = req.body;
  if (!validateLocation(pickup) || !validateLocation(destination)) throw httpError(400, "Valid pickup and destination addresses and coordinates are required");
  if (Number(pickup.latitude) === Number(destination.latitude) && Number(pickup.longitude) === Number(destination.longitude)) throw httpError(400, "Pickup and destination must be different");
  if (await Ride.exists({ riderId: req.user.id, status: { $in: activeStatuses } })) throw httpError(409, "You already have an active ride");

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
  return sendSuccess(res, "Ride requested", { ride, matching: { nearbyDrivers: drivers.length } }, 201);
}

async function getRide(req, res) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw httpError(404, "Ride not found");
  const ride = await Ride.findById(req.params.id);
  if (!ride) throw httpError(404, "Ride not found");
  if (req.user.role === "rider" && String(ride.riderId) !== req.user.id) throw httpError(403, "You cannot view this ride");
  if (req.user.role === "driver" && String(ride.driverId) !== req.user.id) throw httpError(403, "You cannot view this ride");
  return sendSuccess(res, "Ride retrieved", { ride });
}

async function acceptRide(req, res) {
  const ride = await Ride.findById(req.params.id);
  if (!ride) throw httpError(404, "Ride not found");
  if (ride.driverId) throw httpError(409, "Ride has already been accepted");
  ride.driverId = req.user.id;
  applyTransition(ride, "accepted");
  await ride.save();
  notifyRideStatusChanged({ ride });
  return sendSuccess(res, "Ride accepted", { ride });
}

async function updateRideStatus(req, res) {
  const ride = await Ride.findById(req.params.id);
  if (!ride) throw httpError(404, "Ride not found");
  if (String(ride.driverId) !== req.user.id) throw httpError(403, "You cannot update this ride");
  applyTransition(ride, req.body.status);
  await ride.save();
  notifyRideStatusChanged({ ride });
  return sendSuccess(res, "Ride status updated", { ride });
}

async function cancelRide(req, res) {
  const ride = await Ride.findById(req.params.id);
  if (!ride) throw httpError(404, "Ride not found");
  if (req.user.role === "rider" && String(ride.riderId) !== req.user.id) throw httpError(403, "You cannot cancel this ride");
  if (req.user.role === "driver" && String(ride.driverId) !== req.user.id) throw httpError(403, "You cannot cancel this ride");
  applyTransition(ride, req.user.role === "driver" ? "cancelled_by_driver" : "cancelled_by_rider");
  ride.cancellationReason = String(req.body.reason || req.body.cancellationReason || "Cancelled by rider").trim();
  await ride.save();
  notifyRideStatusChanged({ ride });
  return sendSuccess(res, "Ride cancelled", { ride });
}

async function getMyRideHistory(req, res) {
  const filter = req.user.role === "driver" ? { driverId: req.user.id } : { riderId: req.user.id };
  const rides = await Ride.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, "Ride history retrieved", { rides });
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
