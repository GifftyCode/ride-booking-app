import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRide } from "../services/rides.service";
import { api } from "../services/api";

export function DriverRidePage() {
  const { rideId } = useParams();
  const { getApiError } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function loadRide() {
    try {
      const currentRide = await getRide(rideId);
      setRide(currentRide);
      setError("");
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    let polling = false;

    async function refreshRide() {
      if (polling) return;

      polling = true;

      try {
        const currentRide = await getRide(rideId);

        if (mounted) {
          setRide(currentRide);
          setError("");
        }
      } catch (requestError) {
        if (mounted) {
          setError(getApiError(requestError));
        }
      } finally {
        polling = false;

        if (mounted) {
          setLoading(false);
        }
      }
    }

    refreshRide();

    const interval = setInterval(() => {
      refreshRide();
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [rideId, getApiError]);

  async function performRideAction(action) {
    if (actionLoading) return;

    setActionLoading(true);
    setError("");

    try {
      const response = await api.patch(`/rides/${rideId}/${action}`);

      const updatedRide =
        response.data?.data?.ride ||
        response.data?.ride;

      if (updatedRide) {
        setRide(updatedRide);
      } else {
        await loadRide();
      }
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setActionLoading(false);
    }
  }

  function renderActionButton() {
    if (!ride) return null;

    if (ride.status === "accepted") {
      return (
        <button
          className="btn btn-primary"
          disabled={actionLoading}
          onClick={() => performRideAction("arrive")}
        >
          {actionLoading ? "Updating..." : "Mark as Arrived"}
        </button>
      );
    }

    if (ride.status === "arrived") {
      return (
        <button
          className="btn btn-primary"
          disabled={actionLoading}
          onClick={() => performRideAction("start")}
        >
          {actionLoading ? "Starting..." : "Start Trip"}
        </button>
      );
    }

    if (ride.status === "in_progress") {
      return (
        <button
          className="btn btn-primary"
          disabled={actionLoading}
          onClick={() => performRideAction("complete")}
        >
          {actionLoading ? "Completing..." : "Complete Trip"}
        </button>
      );
    }

    return null;
  }

  if (loading) {
    return (
      <main className="page-panel driver-loading">
        Loading active ride...
      </main>
    );
  }

  if (!ride) {
    return (
      <main className="page-panel tracking-page">
        <p className="eyebrow orange-text">Ride unavailable</p>

        <h1>We could not load this ride</h1>

        <p className="form-error" role="alert">
          {error || "This ride is no longer available."}
        </p>

        <Link
          className="btn btn-secondary"
          to="/driver/dashboard"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  const rider =
    ride.riderId && typeof ride.riderId === "object"
      ? ride.riderId
      : null;

  return (
    <main className="page-panel tracking-page">
      <p className="eyebrow green-text">Driver active trip</p>

      <div className="tracking-title">
        <h1>
          {ride.status
            ? ride.status.replaceAll("_", " ")
            : "Active ride"}
        </h1>

        <span className="status-pill">
          {ride.status === "accepted"
            ? "Driver assigned"
            : ride.status === "arrived"
              ? "Driver arrived"
              : ride.status === "in_progress"
                ? "Trip in progress"
                : ride.status === "completed"
                  ? "Trip completed"
                  : ride.status}
        </span>
      </div>

      <p className="muted">
        Ride details are restored from your account when you return to this
        page.
      </p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="tracking-grid">
        <section className="tracking-block">
          <h2>Journey</h2>

          <dl className="ride-details">
            <div>
              <dt>Pickup</dt>
              <dd>{ride.pickup?.address || "Not provided"}</dd>
            </div>

            <div>
              <dt>Destination</dt>
              <dd>{ride.destination?.address || "Not provided"}</dd>
            </div>

            <div>
              <dt>Distance</dt>
              <dd>
                {Number.isFinite(Number(ride.distanceInKm))
                  ? `${Number(ride.distanceInKm).toFixed(1)} km`
                  : "Not available"}
              </dd>
            </div>

            <div>
              <dt>Estimated fare</dt>
              <dd>
                {Number.isFinite(Number(ride.estimatedFare))
                  ? `NGN ${Number(
                      ride.estimatedFare
                    ).toLocaleString()}`
                  : "Not available"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="tracking-block">
          <h2>Rider</h2>

          <dl className="ride-details">
            <div>
              <dt>Name</dt>
              <dd>{rider?.fullName || "Rider"}</dd>
            </div>

            <div>
              <dt>Phone</dt>
              <dd>{rider?.phone || "Not provided"}</dd>
            </div>
          </dl>

          {rider?.phone && (
            <a
              className="btn btn-secondary"
              href={`tel:${rider.phone}`}
            >
              Call rider
            </a>
          )}
        </section>
      </div>

      {renderActionButton()}

      <Link
        className="text-link"
        to="/driver/dashboard"
      >
        Back to driver dashboard
      </Link>
    </main>
  );
}