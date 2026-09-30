import { api } from "./api";

export function requestRide(payload) {
  return api.post("/rides", payload).then((response) => response.data.data);
}

export function estimateRide(payload) {
  return api.post("/rides/estimate", payload).then((response) => response.data.data);
}

export function getCurrentRide() {
  return api.get("/rides/current").then((response) => response.data.data);
}

export function getRide(id) {
  return api.get(`/rides/${id}`).then((response) => response.data.data);
}

export function cancelRide(id, reason) {
  return api.patch(`/rides/${id}/cancel`, { reason }).then((response) => response.data.data);
}
