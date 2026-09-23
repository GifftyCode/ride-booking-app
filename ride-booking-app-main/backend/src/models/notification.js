const mongoose = require("mongoose");

/**
 * Notification (Enoch)
 * --------------------
 * New model, doesn't touch the shared User/Ride/Rating files.
 * Backs the small "notification center" component used inside both
 * the rider and driver apps.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ride: { type: mongoose.Schema.Types.ObjectId, ref: "Ride" },
    type: {
      type: String,
      enum: [
        "ride_requested",
        "ride_accepted",
        "driver_arriving",
        "in_progress",
        "completed",
        "cancelled",
        "rating_prompt",
      ],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
