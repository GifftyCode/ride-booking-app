const mongoose = require("mongoose");

/**
 * Single source of truth for a ride. Rider, Driver, and Admin sides
 * all read/write this same record - never a per-side copy.
 */
const rideSchema = new mongoose.Schema(
  {
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    pickup: {
      address: String,
      lat: Number,
      lng: Number,
    },
    dropoff: {
      address: String,
      lat: Number,
      lng: Number,
    },

    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "driver_arriving",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },

    fareEstimate: Number,
    finalFare: Number,

    cancelledBy: { type: String, enum: ["rider", "driver", null], default: null },
    cancelReason: String,

    requestedAt: { type: Date, default: Date.now },
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
