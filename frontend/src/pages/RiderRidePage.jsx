import { Link, useParams } from "react-router-dom";
import { useRideStatus } from "../hooks/useRideStatus";

export function RiderRidePage() {
  const { rideId } = useParams();
  const { ride, loading, error, notFound } = useRideStatus(rideId);

  if (loading && !ride) return <main className="page-panel driver-loading" aria-live="polite">Loading ride tracking...</main>;
  if (notFound) {
    return (
      <main className="page-panel tracking-page">
        <p className="eyebrow orange-text">Ride unavailable</p>
        <h1>We could not find this ride</h1>
        <p className="form-error" role="alert">{error || "The ride may have been removed."}</p>
        <Link className="btn btn-secondary" to="/rider/dashboard">Back to dashboard</Link>
      </main>
    );
  }
  if (!ride && error) {
    return (
      <main className="page-panel tracking-page">
        <p className="eyebrow orange-text">Tracking unavailable</p>
        <h1>We could not load your ride</h1>
        <p className="form-error" role="alert">{error}. We will retry when the connection is available.</p>
        <Link className="text-link" to="/rider/dashboard">Back to dashboard</Link>
      </main>
    );
  }
  if (!ride) return <main className="page-panel tracking-page"><p className="empty-requests">No active ride was found.</p></main>;

  const vehicle = ride.driverProfile;

  return (
    <main className="page-panel tracking-page">
      <p className="eyebrow blue-text">Ride tracking</p>
      <div className="tracking-title">
        <h1>{ride.status.replaceAll("_", " ")}</h1>
        <span className={`status-pill ${ride.status === "accepted" ? "status-confirmed" : "status-pending"}`}>
          {ride.status === "accepted" ? "Driver assigned" : "Finding a driver"}
        </span>
      </div>
      <p className="muted" role="status">
        {ride.status === "requested" ? "Your request is visible to available drivers." : "Your driver has accepted the ride."}
        {" "}Updates refresh automatically.
      </p>
      {error && <p className="form-error" role="alert">Live update failed: {error}. Retrying automatically.</p>}

      <div className="tracking-grid">
        <section className="tracking-block">
          <h2>Your journey</h2>
          <dl className="ride-details">
            <div><dt>Pickup</dt><dd>{ride.pickup.address}</dd></div>
            <div><dt>Destination</dt><dd>{ride.destination.address}</dd></div>
            <div><dt>Distance</dt><dd>{Number(ride.distanceInKm).toFixed(1)} km</dd></div>
            <div><dt>Estimated fare</dt><dd>NGN {Number(ride.estimatedFare).toLocaleString()}</dd></div>
          </dl>
        </section>
        {ride.driverId ? (
          <section className="tracking-block driver-assignment">
            <p className="eyebrow green-text">Your driver</p>
            <h2>{ride.driverId.fullName || "Driver assigned"}</h2>
            {ride.driverId.phone && <a className="driver-phone" href={`tel:${ride.driverId.phone}`}>{ride.driverId.phone}</a>}
            {vehicle && (
              <dl className="ride-details vehicle-details">
                <div><dt>Vehicle</dt><dd>{[vehicle.vehicleColor, vehicle.vehicleMake, vehicle.vehicleModel].filter(Boolean).join(" ")}</dd></div>
                <div><dt>Plate</dt><dd>{vehicle.plateNumber}</dd></div>
              </dl>
            )}
          </section>
        ) : (
          <section className="tracking-block waiting-driver">
            <h2>Matching you with a driver</h2>
            <p className="muted">Driver and vehicle details will appear here as soon as someone accepts.</p>
          </section>
        )}
      </div>
      <Link className="text-link" to="/rider/dashboard">Back to rider dashboard</Link>
    </main>
  );
}