import { create } from "../models/notification";

/**
 * Notification Service (Enoch)
 * -----------------------------
 * Triggered by every ride status change. Persists an in-app notification
 * for whichever side didn't just cause the change, so the notification
 * center has something to show even if the user wasn't connected to the
 * socket at that moment.
 *
 * This does NOT replace the real-time socket broadcast in sockets/index.js
 * (that's the shared live status/location layer) — it's the durable,
 * "read later" record behind the notification bell.
 */

const MESSAGES = {
  requested: () => "Your ride request has been sent.",
  accepted: () => "A driver has accepted your ride.",
  driver_arriving: () => "Your driver is on the way.",
  in_progress: () => "Your trip has started.",
  completed: () => "Your trip is complete. Don't forget to rate your driver!",
  cancelled: (ride) =>
    `Ride was cancelled${ride.cancelledBy ? ` by the ${ride.cancelledBy}` : ""}.`,
};

/**
 * @param {{userId: string, rideId?: string, type: string, message: string}} params
 */
async function createNotification({ userId, rideId, type, message }) {
  return create({ user: userId, ride: rideId, message, type });
}

/**
 * Call this right after applyTransition() + save() in ride.routes.js.
 * Notifies the rider (drivers already know — they triggered the change).
 * @param {import("mongoose").Document} ride
 */
async function notifyRideStatusChange(ride) {
  const buildMessage = MESSAGES[ride.status];
  if (!buildMessage) return;

  const message = buildMessage(ride);

  await createNotification({
    userId: ride.rider,
    rideId: ride._id,
    type: ride.status,
    message,
  });

  // Once a driver is assigned, keep them in the loop too (e.g. rider cancels).
  if (ride.driver && ride.status === "cancelled") {
    await createNotification({
      userId: ride.driver,
      rideId: ride._id,
      type: ride.status,
      message,
    });
  }

  if (ride.status === "completed" && ride.driver) {
    await createNotification({
      userId: ride.driver,
      rideId: ride._id,
      type: "rating_prompt",
      message: "Trip complete. Don't forget to rate your rider!",
    });
  }
}

export default { createNotification, notifyRideStatusChange };
