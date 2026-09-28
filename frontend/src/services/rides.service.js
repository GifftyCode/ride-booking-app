import { api } from "./api";

export function requestRide(payload) {
  return api.post("/rides", payload).then((response) => response.data);
}
