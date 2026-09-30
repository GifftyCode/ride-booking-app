import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelRide, getRide } from "../services/rides.service";
import { getApiError } from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

export function RiderRidePage() {
  const { rideId } = useParams(); const navigate = useNavigate();
  const [ride, setRide] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function refresh() { try { const result = await getRide(rideId); setRide(result.ride || result.data?.ride); setError(""); } catch (e) { setError(getApiError(e)); } finally { setLoading(false); } }
  useEffect(() => { refresh(); }, [rideId]);
  async function cancel() {
    if (!window.confirm("Cancel this ride request?")) return;
    setBusy(true); setError("");
    try { const result = await cancelRide(rideId, "Cancelled by rider"); setRide(result.ride || result.data?.ride); }
    catch (e) { setError(getApiError(e)); }
    finally { setBusy(false); }
  }
  if (loading) return <main className="page-panel">Loading ride…</main>;
  if (!ride) return <main className="page-panel"><h1>Ride unavailable</h1><p className="form-error">{error || "Ride not found."}</p><button className="btn btn-secondary" onClick={() => navigate("/rider/dashboard")}>Back to dashboard</button></main>;
  return <main className="page-panel tracking-page"><p className="eyebrow blue-text">Ride tracking</p><h1>{ride.status.replaceAll("_", " ")}</h1>
    {ride.status === "requested" && <p className="finding-driver" role="status">Finding a driver…</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <dl className="ride-details"><div><dt>Pickup</dt><dd>{ride.pickup.address}</dd></div><div><dt>Destination</dt><dd>{ride.destination.address}</dd></div><div><dt>Distance</dt><dd>{Number(ride.distanceInKm).toFixed(2)} km</dd></div><div><dt>Estimated fare</dt><dd>{formatCurrency(ride.estimatedFare)}</dd></div><div><dt>Requested</dt><dd>{new Date(ride.requestedAt || ride.createdAt).toLocaleString()}</dd></div><div><dt>Status</dt><dd>{ride.status.replaceAll("_", " ")}</dd></div></dl>
    {["requested", "accepted", "arrived"].includes(ride.status) && <button className="btn btn-secondary" disabled={busy} onClick={cancel}>{busy ? "Cancelling…" : "Cancel ride"}</button>}
  </main>;
}
