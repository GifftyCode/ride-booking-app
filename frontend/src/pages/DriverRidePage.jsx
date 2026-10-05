import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { ConfirmCancelDialog } from "../components/ConfirmCancelDialog";
import { PageSkeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useRideStatus } from "../hooks/useRideStatus";
import { cancelRide, updateRideLifecycle } from "../services/rides.service";

const DRIVER_ACTIONS = {
  accepted: { action: "arrive", label: "Mark as arrived" },
  arrived: { action: "start", label: "Start trip" },
  in_progress: { action: "complete", label: "Complete trip" },
};
const TERMINAL_STATUSES = new Set(["completed", "cancelled_by_rider", "cancelled_by_driver"]);
const formatStatus = (status) => status.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");

export function DriverRidePage() {
  const { rideId } = useParams();
  const { getApiError } = useAuth();
  const { ride, setRide, loading, error, statusNotice } = useRideStatus(rideId);
  const [busy, setBusy] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reason, setReason] = useState("");

  async function applyAction(action) {
    setBusy(true);
    try {
      setRide(await updateRideLifecycle(rideId, action));
    } catch (actionError) {
      // The polling hook continues to preserve the last successful ride.
      setRide((current) => current ? { ...current, actionError: getApiError(actionError) } : current);
    } finally {
      setBusy(false);
    }
  }

  async function confirmCancellation() {
    setBusy(true);
    try {
      setRide(await cancelRide(rideId, reason));
      setShowCancelDialog(false);
    } catch (cancelError) {
      setRide((current) => current ? { ...current, actionError: getApiError(cancelError) } : current);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <PageSkeleton variant="tracking" />;
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
      <h1>{formatStatus(ride.status)}</h1>
      <p className="muted">Ride details are restored from your account when you return to this page.</p>
      {statusNotice && <p className="form-success" role="status">{statusNotice}</p>}
      {(error || ride.actionError) && <p className="form-error" role="alert">{ride.actionError || error}</p>}
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
      <div className="trip-actions">
        {DRIVER_ACTIONS[ride.status] && (
          <Button type="button" disabled={busy} onClick={() => applyAction(DRIVER_ACTIONS[ride.status].action)}>
            {busy ? "Updating..." : DRIVER_ACTIONS[ride.status].label}
          </Button>
        )}
        {["accepted", "arrived"].includes(ride.status) && (
          <Button type="button" variant="danger" disabled={busy} onClick={() => setShowCancelDialog(true)}>Cancel ride</Button>
        )}
        <Link className="btn btn-secondary" to="/driver/dashboard">
          {TERMINAL_STATUSES.has(ride.status) ? "Return to dashboard" : "Back to driver dashboard"}
        </Link>
      </div>
      <ConfirmCancelDialog
        open={showCancelDialog}
        reason={reason}
        onReasonChange={setReason}
        onConfirm={confirmCancellation}
        onClose={() => setShowCancelDialog(false)}
        busy={busy}
      />
    </main>
  );
}
