const BASE_FARE = 800;
const PER_KM_RATE = 250;
const PER_MINUTE_RATE = 45;

function calculateFareEstimate({ distanceKm = 0, durationMinutes = 0 } = {}) {
  const fareEstimate = Math.round(
    BASE_FARE + distanceKm * PER_KM_RATE + durationMinutes * PER_MINUTE_RATE
  );

  return {
    fareEstimate,
    currency: "NGN",
    breakdown: {
      baseFare: BASE_FARE,
      distance: distanceKm * PER_KM_RATE,
      time: durationMinutes * PER_MINUTE_RATE,
    },
  };
}

module.exports = { calculateFareEstimate };
