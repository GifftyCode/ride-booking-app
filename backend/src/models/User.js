const mongoose = require("mongoose");

/**
 * Single User model shared by all three sides (rider, driver, admin).
 * `role` determines which fields are relevant and which app the user logs into.
 * Keeping one model avoids duplicated auth/user logic across teammates.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["rider", "driver", "admin"],
      required: true,
    },
    photoUrl: { type: String },

    // Rider-only
    savedAddresses: [
      {
        label: String, // e.g. "Home", "Work"
        address: String,
        lat: Number,
        lng: Number,
      },
    ],

    // Driver-only
    driverProfile: {
      vehicleMake: String,
      vehicleModel: String,
      plateNumber: String,
      licenseNumber: String,
      isVerified: { type: Boolean, default: false }, // admin approves docs
      isOnline: { type: Boolean, default: false },
      currentLocation: {
        lat: Number,
        lng: Number,
        updatedAt: Date,
      },
    },

    ratingAverage: { type: Number, default: 5 },
    ratingCount: { type: Number, default: 0 },

    // Set by Admin (customer or driver management)
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
