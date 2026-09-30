import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { estimateRide, getCurrentRide, requestRide } from "../services/rides.service";
import { getApiError } from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

const initialForm = {
  pickup: { address: "", latitude: "", longitude: "" },
  destination: { address: "", latitude: "", longitude: "" },
};

export function RiderDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [estimate, setEstimate] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCurrentRide().then(({ ride }) => setActiveRide(ride)).catch((e) => setError(getApiError(e))).finally(() => setLoading(false));
  }, []);

  function update(field, key, value) {
    setForm((current) => ({ ...current, [field]: { ...current[field], [key]: value } }));
    setEstimate(null);
  }

  function validate() {
    for (const [label, place] of [["Pickup", form.pickup], ["Destination", form.destination]]) {
      if (!place.address.trim()) return `${label} address is required.`;
      const lat = Number(place.latitude); const lng = Number(place.longitude);
      if (!place.latitude || !place.longitude || !Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) return `${label} coordinates must be valid latitude and longitude values.`;
    }
    if (Number(form.pickup.latitude) === Number(form.destination.latitude) && Number(form.pickup.longitude) === Number(form.destination.longitude)) return "Pickup and destination must be different.";
    return "";
  }

  async function calculate() {
    const validation = validate();
    if (validation) { setError(validation); return; }
    setError(""); setEstimating(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, p]) => [key, { ...p, latitude: Number(p.latitude), longitude: Number(p.longitude) }]));
      const result = await estimateRide(payload);
      setEstimate(result.data || result);
    } catch (e) { setError(getApiError(e)); }
    finally { setEstimating(false); }
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting || !estimate) return;
    const validation = validate();
    if (validation) { setError(validation); return; }
    setError(""); setSubmitting(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, p]) => [key, { ...p, latitude: Number(p.latitude), longitude: Number(p.longitude) }]));
      const result = await requestRide(payload);
      navigate(`/rider/rides/${(result.ride || result.data?.ride)._id}`);
    } catch (e) { setError(getApiError(e)); }
    finally { setSubmitting(false); }
  }

  if (loading) return <main className="page-panel" aria-live="polite">Loading your ride…</main>;
  return <main className="dashboard-grid">
    <section className="page-panel">
      <p className="eyebrow blue-text">Rider dashboard</p>
      <h1>Welcome, {user?.fullName}</h1>
      {activeRide ? <><p className="muted">You have an active ride request.</p><button className="btn btn-primary" onClick={() => navigate(`/rider/rides/${activeRide._id}`)}>Continue Tracking Ride</button></> : <>
        <p className="muted">Enter addresses and coordinates to get a fare estimate.</p>
        <form className="stack" onSubmit={submit}>
          {[["pickup", "Pickup"], ["destination", "Destination"]].map(([key, label]) => <fieldset className="location-fields" key={key}><legend>{label}</legend>
            <label className="field"><span>{label} address</span><input required value={form[key].address} onChange={(e) => update(key, "address", e.target.value)} placeholder={`${label} address`} /></label>
            <div className="quick-form"><label className="field"><span>Latitude</span><input required type="number" step="any" min="-90" max="90" value={form[key].latitude} onChange={(e) => update(key, "latitude", e.target.value)} /></label><label className="field"><span>Longitude</span><input required type="number" step="any" min="-180" max="180" value={form[key].longitude} onChange={(e) => update(key, "longitude", e.target.value)} /></label></div>
          </fieldset>)}
          {error && <p className="form-error" role="alert">{error}</p>}
          {estimate && <div className="request-card" aria-live="polite"><strong>Estimated distance: {estimate.distanceInKm} km</strong><strong>Estimated fare: {formatCurrency(estimate.estimatedFare, estimate.currency || "NGN")}</strong></div>}
          <div className="hero-actions"><button className="btn btn-secondary" type="button" onClick={calculate} disabled={estimating || submitting}>{estimating ? "Calculating…" : "Get fare estimate"}</button><button className="btn btn-primary" type="submit" disabled={!estimate || submitting || estimating}>{submitting ? "Requesting…" : "Request ride"}</button></div>
        </form>
      </>}
    </section>
    <aside className="page-panel"><p className="eyebrow green-text">Your ride</p><p className="muted">Request a fare estimate to see your trip price before booking.</p></aside>
  </main>;
}
