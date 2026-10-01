const Ride = require("../models/Ride");
const DriverProfile = require("../models/DriverProfile");
const { applyTransition, assertValidTransition } = require("../services/rideStateMachine");
const { calculateFareEstimate } = require("../services/pricingEngine");
const { findAvailableDrivers } = require("../services/matchingEngine");
const { notifyRideRequested, notifyRideStatusChanged } = require("../services/notificationService");
const { sendError, sendSuccess } = require("../services/apiResponse");
const { presentRide } = require("../services/ridePresenter");

const ACTIVE_RIDE_STATUSES = ["accepted", "arrived", "in_progress"];
const VEHICLE_FIELDS = ["vehicleMake", "vehicleModel", "vehicleColor", "plateNumber"];
const RIDER_CURRENT_STATUSES = ["requested", ...ACTIVE_RIDE_STATUSES];

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

  const isRider = ride.riderId.toString() === req.user.id;
  const isDriver = ride.driverId?.toString() === req.user.id;
  if (!isRider && !isDriver) return sendError(res, "Not authorized to view this ride", 403);

  res.json({ ride: await presentRide(ride) });
}

async function getAvailableRides(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const profile = await DriverProfile.findOne({ userId: req.user.id });
    if (!profile) return sendError(res, "Driver profile not found", 404);
    if (VEHICLE_FIELDS.some((field) => !profile[field]?.trim())) {
      return sendError(res, "Complete vehicle information before viewing requests", 409);
    }

    const activeRide = await Ride.findOne({ driverId: req.user.id, status: { $in: ACTIVE_RIDE_STATUSES } })
      .select("_id");
    if (!profile.isAvailable || profile.activeRideId || activeRide) {
      return sendError(res, "Go online and finish any active ride to view requests", 409);
    }

    const filter = { status: "requested", driverId: null };
    const [rides, total] = await Promise.all([
      Ride.find(filter).sort({ requestedAt: 1, _id: 1 }).skip((page - 1) * limit).limit(limit),
      Ride.countDocuments(filter),
    ]);

    return sendSuccess(res, "Available rides retrieved", {
      rides,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
}

async function acceptRide(req, res) {
  let reservedProfile;
  let rideClaimed = false;
  try {
    assertValidTransition("requested", "accepted");
    const profile = await DriverProfile.findOne({ userId: req.user.id });
    if (!profile) return sendError(res, "Driver profile not found", 404);
    if (VEHICLE_FIELDS.some((field) => !profile[field]?.trim())) {
      return sendError(res, "Complete vehicle information before accepting requests", 409);
    }

    const activeRide = await Ride.findOne({ driverId: req.user.id, status: { $in: ACTIVE_RIDE_STATUSES } })
      .select("_id");
    if (activeRide) return sendError(res, "You already have an active ride", 409);

    reservedProfile = await DriverProfile.findOneAndUpdate(
      {
        userId: req.user.id,
        isAvailable: true,
        activeRideId: null,
        $and: VEHICLE_FIELDS.map((field) => ({ [field]: { $exists: true, $ne: "" } })),
      },
      { $set: { activeRideId: req.params.id, isAvailable: false } },
      { new: true }
    );

    if (!reservedProfile) {
      const profile = await DriverProfile.findOne({ userId: req.user.id });
      if (!profile) return sendError(res, "Driver profile not found", 404);
      return sendError(res, "You must be available and have no active ride to accept requests", 409);
    }

    const ride = await Ride.findOneAndUpdate(
      { _id: req.params.id, status: "requested", driverId: null },
      { $set: { driverId: req.user.id, status: "accepted", acceptedAt: new Date() } },
      { new: true, runValidators: true }
    );

    if (!ride) {
      await DriverProfile.updateOne(
        { _id: reservedProfile._id, activeRideId: req.params.id },
        { $set: { activeRideId: null, isAvailable: true } }
      );
      const existingRide = await Ride.exists({ _id: req.params.id });
      return sendError(res, existingRide ? "Ride has already been accepted or is no longer available" : "Ride not found", existingRide ? 409 : 404);
    }

    rideClaimed = true;
    const populatedRide = await presentRide(ride);
    notifyRideStatusChanged({ ride });
    return sendSuccess(res, "Ride accepted", { ride: populatedRide });
  } catch (err) {
    if (reservedProfile && !rideClaimed) {
      await DriverProfile.updateOne(
        { _id: reservedProfile._id, activeRideId: req.params.id },
        { $set: { activeRideId: null, isAvailable: true } }
      );
    }
    const statusCode = err.status || (err.name === "CastError" ? 400 : 500);
    return res.status(statusCode).json({ error: statusCode >= 500 ? "Could not accept ride" : err.message });
  }
}

async function getCurrentRiderRide(req, res, next) {
  try {
    const ride = await Ride.findOne({
      riderId: req.user.id,
      status: { $in: RIDER_CURRENT_STATUSES },
    }).sort({ requestedAt: -1 });

    return sendSuccess(res, "Current ride retrieved", {
      ride: ride ? await presentRide(ride) : null,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateRideStatus(req, res) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: "Ride not found" });
    if (ride.driverId?.toString() !== req.user.id) {
      return sendError(res, "Only the assigned driver can update this ride", 403);
    }

    applyTransition(ride, req.body.status);
    await ride.save();

    if (ride.status === "completed") {
      await DriverProfile.updateOne(
        { userId: ride.driverId, activeRideId: ride._id },
        { $set: { activeRideId: null } }
      );
    }

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

    if (ride.driverId) {
      await DriverProfile.updateOne(
        { userId: ride.driverId, activeRideId: ride._id },
        { $set: { activeRideId: null } }
      );
    }

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
  getAvailableRides,
  getCurrentRiderRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getMyRideHistory,
};
