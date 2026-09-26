const BASE_FARE = Number(process.env.BASE_FARE || 1000);
const PER_KM_RATE = Number(process.env.RATE_PER_KM || 500);
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
