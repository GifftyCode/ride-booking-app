const Ride = require("../models/Ride");
const DriverProfile = require("../models/DriverProfile");

const {
  applyTransition,
  assertValidTransition,
} = require("../services/rideStateMachine");

const {
  calculateFareEstimate,
  calculateDistanceKm,
} = require("../services/pricingEngine");

const { findAvailableDrivers } = require("../services/matchingEngine");

const {
  notifyRideRequested,
  notifyRideStatusChanged,
} = require("../services/notificationService");

const {
  sendError,
  sendSuccess,
} = require("../services/apiResponse");

const { httpError } = require("../services/httpErrors");
const { presentRide } = require("../services/ridePresenter");

const ACTIVE_RIDE_STATUSES = ["accepted", "arrived", "in_progress"];

const RIDER_CURRENT_STATUSES = [
  "requested",
  ...ACTIVE_RIDE_STATUSES,
];

const VEHICLE_FIELDS = [
  "vehicleMake",
  "vehicleModel",
  "vehicleColor",
  "plateNumber",
];

function validateLocation(location) {
  return (
    location &&
    typeof location.address === "string" &&
    location.address.trim() &&
    Number.isFinite(Number(location.latitude)) &&
    Number(location.latitude) >= -90 &&
    Number(location.latitude) <= 90 &&
    Number.isFinite(Number(location.longitude)) &&
    Number(location.longitude) >= -180 &&
    Number(location.longitude) <= 180
  );
}

async function estimateRide(req, res) {
  const { pickup, destination } = req.body;

  if (!validateLocation(pickup) || !validateLocation(destination)) {
    throw httpError(
      400,
      "Valid pickup and destination addresses and coordinates are required"
    );
  }

  if (
    Number(pickup.latitude) === Number(destination.latitude) &&
    Number(pickup.longitude) === Number(destination.longitude)
  ) {
    throw httpError(400, "Pickup and destination must be different");
  }

  const distanceInKm = calculateDistanceKm(pickup, destination);

  const estimate = calculateFareEstimate({
    distanceKm: distanceInKm,
  });

  return sendSuccess(res, "Fare estimate calculated", {
    distanceInKm: Number(distanceInKm.toFixed(2)),
    estimatedFare: estimate.fareEstimate,
    currency: estimate.currency,
    breakdown: estimate.breakdown,
  });
}

async function getCurrentRide(req, res) {
  const ride = await Ride.findOne({
    riderId: req.user.id,
    status: { $in: RIDER_CURRENT_STATUSES },
  }).sort({ requestedAt: -1 });

  return sendSuccess(res, "Current ride retrieved", {
    ride: ride || null,
  });
}

async function createRide(req, res) {
  const { pickup, destination } = req.body;

  if (!validateLocation(pickup) || !validateLocation(destination)) {
    throw httpError(
      400,
      "Valid pickup and destination addresses and coordinates are required"
    );
  }

  if (
    Number(pickup.latitude) === Number(destination.latitude) &&
    Number(pickup.longitude) === Number(destination.longitude)
  ) {
    throw httpError(400, "Pickup and destination must be different");
  }

  const existingRide = await Ride.exists({
    riderId: req.user.id,
    status: { $in: RIDER_CURRENT_STATUSES },
  });

  if (existingRide) {
    throw httpError(409, "You already have an active ride");
  }

  const distanceInKm = calculateDistanceKm(pickup, destination);

  const estimate = calculateFareEstimate({
    distanceKm: distanceInKm,
  }).fareEstimate;

  const ride = await Ride.create({
    riderId: req.user.id,
    pickup,
    destination,
    distanceInKm: Number(distanceInKm.toFixed(2)),
    estimatedFare: estimate,
  });

  const drivers = await findAvailableDrivers({ pickup });

  notifyRideRequested({
    ride,
    drivers,
  });

  return sendSuccess(
    res,
    "Ride requested",
    {
      ride,
      matching: {
        nearbyDrivers: drivers.length,
      },
    },
    201
  );
}

async function getRide(req, res) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    throw httpError(404, "Ride not found");
  }

  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    throw httpError(404, "Ride not found");
  }

  const isRider =
    ride.riderId.toString() === req.user.id;

  const isDriver =
    ride.driverId &&
    ride.driverId.toString() === req.user.id;

  if (!isRider && !isDriver) {
    throw httpError(403, "You cannot view this ride");
  }

  const presentedRide = await presentRide(ride);

  return sendSuccess(res, "Ride retrieved", {
    ride: presentedRide,
  });
}

async function getAvailableRides(req, res, next) {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(req.query.limit, 10) || 10
      )
    );

    const profile = await DriverProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return sendError(
        res,
        "Driver profile not found",
        404
      );
    }

    if (
      VEHICLE_FIELDS.some(
        (field) => !profile[field]?.trim()
      )
    ) {
      return sendError(
        res,
        "Complete vehicle information before viewing requests",
        409
      );
    }

    const activeRide = await Ride.findOne({
      driverId: req.user.id,
      status: { $in: ACTIVE_RIDE_STATUSES },
    }).select("_id");

    if (
      !profile.isAvailable ||
      profile.activeRideId ||
      activeRide
    ) {
      return sendError(
        res,
        "Go online and finish any active ride to view requests",
        409
      );
    }

    const filter = {
      status: "requested",
      driverId: null,
    };

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .sort({ requestedAt: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit),

      Ride.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      "Available rides retrieved",
      {
        rides,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    );
  } catch (error) {
    return next(error);
  }
}

async function acceptRide(req, res) {
  let reservedProfile;
  let rideClaimed = false;

  try {
    assertValidTransition(
      "requested",
      "accepted"
    );

    const profile = await DriverProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return sendError(
        res,
        "Driver profile not found",
        404
      );
    }

    if (
      VEHICLE_FIELDS.some(
        (field) => !profile[field]?.trim()
      )
    ) {
      return sendError(
        res,
        "Complete vehicle information before accepting requests",
        409
      );
    }

    const activeRide = await Ride.findOne({
      driverId: req.user.id,
      status: { $in: ACTIVE_RIDE_STATUSES },
    }).select("_id");

    if (activeRide) {
      return sendError(
        res,
        "You already have an active ride",
        409
      );
    }

    reservedProfile =
      await DriverProfile.findOneAndUpdate(
        {
          userId: req.user.id,
          isAvailable: true,
          activeRideId: null,
          $and: VEHICLE_FIELDS.map((field) => ({
            [field]: {
              $exists: true,
              $ne: "",
            },
          })),
        },
        {
          $set: {
            activeRideId: req.params.id,
            isAvailable: false,
          },
        },
        {
          new: true,
        }
      );

    if (!reservedProfile) {
      const currentProfile =
        await DriverProfile.findOne({
          userId: req.user.id,
        });

      if (!currentProfile) {
        return sendError(
          res,
          "Driver profile not found",
          404
        );
      }

      return sendError(
        res,
        "You must be available and have no active ride to accept requests",
        409
      );
    }

    const ride = await Ride.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "requested",
        driverId: null,
      },
      {
        $set: {
          driverId: req.user.id,
          status: "accepted",
          acceptedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ride) {
      await DriverProfile.updateOne(
        {
          _id: reservedProfile._id,
          activeRideId: req.params.id,
        },
        {
          $set: {
            activeRideId: null,
            isAvailable: true,
          },
        }
      );

      const existingRide = await Ride.exists({
        _id: req.params.id,
      });

      return sendError(
        res,
        existingRide
          ? "Ride has already been accepted or is no longer available"
          : "Ride not found",
        existingRide ? 409 : 404
      );
    }

    rideClaimed = true;

    const populatedRide =
      await presentRide(ride);

    notifyRideStatusChanged({ ride });

    return sendSuccess(
      res,
      "Ride accepted",
      {
        ride: populatedRide,
      }
    );
  } catch (error) {
    if (
      reservedProfile &&
      !rideClaimed
    ) {
      await DriverProfile.updateOne(
        {
          _id: reservedProfile._id,
          activeRideId: req.params.id,
        },
        {
          $set: {
            activeRideId: null,
            isAvailable: true,
          },
        }
      );
    }

    const statusCode =
      error.status ||
      (error.name === "CastError"
        ? 400
        : 500);

    return res
      .status(statusCode)
      .json({
        error:
          statusCode >= 500
            ? "Could not accept ride"
            : error.message,
      });
  }
}

async function getCurrentRiderRide(
  req,
  res,
  next
) {
  try {
    const ride = await Ride.findOne({
      riderId: req.user.id,
      status: {
        $in: RIDER_CURRENT_STATUSES,
      },
    }).sort({
      requestedAt: -1,
    });

    return sendSuccess(
      res,
      "Current ride retrieved",
      {
        ride: ride
          ? await presentRide(ride)
          : null,
      }
    );
  } catch (error) {
    return next(error);
  }
}

async function updateRideStatus(req, res) {
  try {
    const ride = await Ride.findById(
      req.params.id
    );

    if (!ride) {
      return sendError(
        res,
        "Ride not found",
        404
      );
    }

    if (
      ride.driverId?.toString() !==
      req.user.id
    ) {
      return sendError(
        res,
        "Only the assigned driver can update this ride",
        403
      );
    }

    applyTransition(
      ride,
      req.body.status
    );

    await ride.save();

    if (ride.status === "completed") {
      await DriverProfile.updateOne(
        {
          userId: ride.driverId,
          activeRideId: ride._id,
        },
        {
          $set: {
            activeRideId: null,
          },
        }
      );
    }

    notifyRideStatusChanged({ ride });

    return sendSuccess(
      res,
      "Ride status updated",
      {
        ride,
      }
    );
  } catch (error) {
    const statusCode =
      error.name ===
      "InvalidTransitionError"
        ? 400
        : 500;

    return sendError(
      res,
      statusCode === 500
        ? "Could not update ride status"
        : error.message,
      statusCode
    );
  }
}

async function cancelRide(req, res) {
  try {
    const ride = await Ride.findById(
      req.params.id
    );

    if (!ride) {
      return sendError(
        res,
        "Ride not found",
        404
      );
    }

    const isRider =
      req.user.role === "rider" &&
      ride.riderId.toString() ===
        req.user.id;

    const isDriver =
      req.user.role === "driver" &&
      ride.driverId &&
      ride.driverId.toString() ===
        req.user.id;

    if (!isRider && !isDriver) {
      return sendError(
        res,
        "You cannot cancel this ride",
        403
      );
    }

    const nextStatus =
      req.user.role === "driver"
        ? "cancelled_by_driver"
        : "cancelled_by_rider";

    applyTransition(
      ride,
      nextStatus
    );

    ride.cancellationReason = String(
      req.body.reason ||
        req.body.cancellationReason ||
        `Cancelled by ${req.user.role}`
    ).trim();

    await ride.save();

    if (ride.driverId) {
      await DriverProfile.updateOne(
        {
          userId: ride.driverId,
          activeRideId: ride._id,
        },
        {
          $set: {
            activeRideId: null,
          },
        }
      );
    }

    notifyRideStatusChanged({ ride });

    return sendSuccess(
      res,
      "Ride cancelled",
      {
        ride,
      }
    );
  } catch (error) {
    const statusCode =
      error.name ===
      "InvalidTransitionError"
        ? 400
        : 500;

    return sendError(
      res,
      statusCode === 500
        ? "Could not cancel ride"
        : error.message,
      statusCode
    );
  }
}

async function getMyRideHistory(req, res) {
  const filter =
    req.user.role === "driver"
      ? { driverId: req.user.id }
      : { riderId: req.user.id };

  const rides = await Ride.find(filter)
    .sort({ createdAt: -1 });

  return sendSuccess(
    res,
    "Ride history retrieved",
    {
      rides,
    }
  );
}

module.exports = {
  createRide,
  estimateRide,
  getCurrentRide,
  getRide,
  getAvailableRides,
  getCurrentRiderRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getMyRideHistory,
};