const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Thin fetch wrapper. Every function here returns the parsed JSON body,
 * or throws an Error with the backend's error message so components can
 * just try/catch and show err.message.
 */
async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

export const api = {
  signup: (payload) =>
    request("/api/auth/signup", { method: "POST", body: { ...payload, role: "driver" } }),

  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),

  me: (token) => request("/api/auth/me", { token }),

  // Filled in as later steps build these out:
  // toggleOnline, acceptRide, updateStatus, getHistory, etc.
};
