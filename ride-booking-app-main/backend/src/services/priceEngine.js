/**
 * Pricing Engine (Enoch)
 * ----------------------
 * Pure calculation module — no DB writes here. Ride routes call this and
 * store the result on the Ride document themselves.
 */

const BASE_FARE = 300; // flat starting fare (your currency's smallest sane unit, e.g. NGN)
const RATE_PER_KM = 120;
const RATE_PER_MIN = 25;
const MIN_FARE = 500;
const AVG_SPEED_KMH = 30; // used only for the pre-trip *estimate*, not the final fare

/**
 * Haversine distance between two lat/lng points, in kilometers.
 */
function distanceKm(a, b) {
  if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) {
    return 0;
  }
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Pre-trip fare estimate, shown to the rider before they confirm the request.
 * @param {{pickup: {lat:number,lng:number}, dropoff: {lat:number,lng:number}}} params
 * @param {number} [surgeMultiplier=1]
 */
function estimateFare({ pickup, dropoff }, surgeMultiplier = 1) {
  const km = distanceKm(pickup, dropoff);
  const estimatedMinutes = (km / AVG_SPEED_KMH) * 60;

  const raw = BASE_FARE + km * RATE_PER_KM + estimatedMinutes * RATE_PER_MIN;
  const fare = Math.max(raw * surgeMultiplier, MIN_FARE);

  return {
    fareEstimate: Math.round(fare),
    distanceKm: Number(km.toFixed(2)),
    estimatedMinutes: Math.round(estimatedMinutes),
    surgeMultiplier,
  };
}

/**
 * Final fare, computed once a ride has actually completed.
 * Uses real elapsed time (startedAt -> completedAt) plus pickup/dropoff distance.
 * @param {import("mongoose").Document} ride
 */
function calculateFinalFare(ride) {
  const km = distanceKm(ride.pickup, ride.dropoff);

  let minutes = (km / AVG_SPEED_KMH) * 60;
  if (ride.startedAt && ride.completedAt) {
    minutes = (new Date(ride.completedAt) - new Date(ride.startedAt)) / 60000;
  }

  const raw = BASE_FARE + km * RATE_PER_KM + Math.max(minutes, 0) * RATE_PER_MIN;
  return Math.round(Math.max(raw, MIN_FARE));
}

module.exports = { estimateFare, calculateFinalFare, distanceKm };
