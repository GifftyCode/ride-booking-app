function notifyRideRequested({ ride, drivers = [] }) {
  // TODO: emit ride:request to nearby driver sockets or push notification provider.
  return {
    rideId: ride._id,
    recipientCount: drivers.length,
    channel: "in_app",
  };
}

function notifyRideStatusChanged({ ride }) {
  // TODO: centralize status-change notifications for rider, driver, and admin.
  return {
    rideId: ride._id,
    status: ride.status,
    channel: "in_app",
  };
}

module.exports = { notifyRideRequested, notifyRideStatusChanged };
