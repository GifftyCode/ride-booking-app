import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRide } from "../services/rides.service";

export function DriverRidePage() {
  const { rideId } = useParams();
  const { getApiError } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getRide(rideId)
      .then((currentRide) => { if (mounted) setRide(currentRide); })
      .catch((requestError) => { if (mounted) setError(getApiError(requestError)); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [rideId, getApiError]);

  if (loading) return <main className="page-panel driver-loading">Loading active ride...</main>;
  if (!ride) {
    return (
      <main className="page-panel tracking-page">
        <p className="eyebrow orange-text">Ride unavailable</p>
        <p className="form-error" role="alert">{error || "This ride is no longer available."}</p>
        <Link className="btn btn-secondary" to="/driver/dashboard">Back to dashboard</Link>
      </main>
    );
  }

  return (
    <main className="page-panel tracking-page">
      <p className="eyebrow green-text">Driver active trip</p>
      <h1>{ride.status.replaceAll("_", " ")}</h1>
      <p className="muted">Ride details are restored from your account when you return to this page.</p>
      <div className="tracking-grid">
        <section className="tracking-block">
          <h2>Journey</h2>
          <dl className="ride-details">
            <div><dt>Pickup</dt><dd>{ride.pickup.address}</dd></div>
            <div><dt>Destination</dt><dd>{ride.destination.address}</dd></div>
            <div><dt>Distance</dt><dd>{Number(ride.distanceInKm).toFixed(1)} km</dd></div>
            <div><dt>Estimated fare</dt><dd>NGN {Number(ride.estimatedFare).toLocaleString()}</dd></div>
          </dl>
        </section>
        <section className="tracking-block">
          <h2>Rider</h2>
          <dl className="ride-details">
            <div><dt>Name</dt><dd>{ride.riderId?.fullName || "Rider"}</dd></div>
            <div><dt>Phone</dt><dd>{ride.riderId?.phone || "Not provided"}</dd></div>
          </dl>
          {ride.riderId?.phone && <a className="btn btn-primary" href={`tel:${ride.riderId.phone}`}>Call rider</a>}
        </section>
      </div>
      <Link className="text-link" to="/driver/dashboard">Back to driver dashboard</Link>
    </main>
  );
}