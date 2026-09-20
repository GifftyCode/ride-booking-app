/**
 * Ride State Machine
 * -------------------
 * Every status change for a ride MUST go through here. This is what
 * keeps rider, driver, and admin views in sync - no one updates
 * `ride.status` directly anywhere else in the codebase.
 */

const VALID_TRANSITIONS = {
  requested: ["accepted", "cancelled"],
  accepted: ["driver_arriving", "cancelled"],
  driver_arriving: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
};

class InvalidTransitionError extends Error {
  constructor(from, to) {
    super(`Cannot transition ride from "${from}" to "${to}"`);
    this.name = "InvalidTransitionError";
  }
}

/**
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @throws {InvalidTransitionError} if the transition isn't allowed
 */
function assertValidTransition(currentStatus, nextStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new InvalidTransitionError(currentStatus, nextStatus);
  }
}

/**
 * Applies a status change to a ride document, sets the matching timestamp,
 * and returns the updated ride. Does NOT save - caller decides when to persist
 * (so it can be combined with other field updates, e.g. driver assignment).
 */
function applyTransition(ride, nextStatus) {
  assertValidTransition(ride.status, nextStatus);

  ride.status = nextStatus;

  const timestampField = {
    accepted: "acceptedAt",
    in_progress: "startedAt",
    completed: "completedAt",
  }[nextStatus];

  if (timestampField) {
    ride[timestampField] = new Date();
  }

  return ride;
}

module.exports = {
  VALID_TRANSITIONS,
  InvalidTransitionError,
  assertValidTransition,
  applyTransition,
};
