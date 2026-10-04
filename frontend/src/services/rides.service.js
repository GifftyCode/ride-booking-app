import { api } from "./api";

export function requestRide(payload) {
  return api
    .post("/rides", payload)
    .then((response) => response.data.data);
}

export function estimateRide(payload) {
  return api
    .post("/rides/estimate", payload)
    .then((response) => response.data.data);
}

export function getCurrentRide() {
  return api
    .get("/rides/current")
    .then((response) => response.data.data);
}

export async function getRide(rideId, options = {}) {
  const response = await api.get(
    `/rides/${rideId}`,
    options
  );

  return response.data.data.ride;
}

export function cancelRide(id, reason) {
  return api
    .patch(`/rides/${id}/cancel`, { reason })
    .then((response) => response.data.data);
}

export async function getCurrentRiderRide() {
  const response = await api.get("/rides/current");

  return response.data.data.ride;
}

export async function getAvailableRides(
  page = 1,
  limit = 10
) {
  const response = await api.get(
    "/rides/available",
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data.data;
}

export async function acceptRide(rideId) {
  const response = await api.patch(
    `/rides/${rideId}/accept`
  );

  return response.data.data.ride;
}