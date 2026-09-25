const User = require("../models/User");

async function findAvailableDrivers({ pickup, limit = 5 } = {}) {
  const drivers = await User.find({
    role: "driver",
    isSuspended: false,
    "driverProfile.isVerified": true,
    "driverProfile.isOnline": true,
  })
    .select("name phone driverProfile ratingAverage ratingCount")
    .limit(limit);

  // TODO: sort by distance from pickup once maps/geospatial data is ready.
  return drivers.map((driver) => ({
    driver,
    distanceKm: pickup ? null : undefined,
  }));
}

module.exports = { findAvailableDrivers };
