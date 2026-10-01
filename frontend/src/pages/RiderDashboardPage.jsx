import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { getCurrentRiderRide, requestRide } from "../services/rides.service";

const emptyLocation = { address: "", latitude: "", longitude: "" };
const emptyForm = { pickup: { ...emptyLocation }, destination: { ...emptyLocation } };

function calculateDistanceInKm(start, end) {
  const radians = (degrees) => degrees * (Math.PI / 180);
  const latitudeDelta = radians(end.latitude - start.latitude);
  const longitudeDelta = radians(end.longitude - start.longitude);
  const value = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(start.latitude)) * Math.cos(radians(end.latitude)) *
    Math.sin(longitudeDelta / 2) ** 2;
  return Math.max(0.1, 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)));
}

export function RiderDashboardPage() {
  const { user, getApiError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getCurrentRiderRide()
      .then((ride) => { if (mounted) setActiveRide(ride); })
      .catch((requestError) => { if (mounted) setError(getApiError(requestError)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [getApiError]);

  function updateLocation(place, field, value) {
    setForm((current) => ({
      ...current,
      [place]: { ...current[place], [field]: value },
    }));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }
    setLocationBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          pickup: {
            ...current.pickup,
            address: current.pickup.address || "Current location",
            latitude: String(coords.latitude),
            longitude: String(coords.longitude),
          },
        }));
        setLocationBusy(false);
      },
      (locationError) => {
        setError(locationError.message || "Unable to access your location.");
        setLocationBusy(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function validateForm() {
    for (const [label, location] of [["Pickup", form.pickup], ["Destination", form.destination]]) {
      const latitude = Number(location.latitude);
      const longitude = Number(location.longitude);
      if (!location.address.trim()) return `${label} address is required.`;
      if (!location.latitude || !location.longitude || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return `Enter valid coordinates for ${label.toLowerCase()}.`;
      }
    }
    return "";
  }

  async function submitRide(event) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    const pickup = {
      ...form.pickup,
      latitude: Number(form.pickup.latitude),
      longitude: Number(form.pickup.longitude),
    };
    const destination = {
      ...form.destination,
      latitude: Number(form.destination.latitude),
      longitude: Number(form.destination.longitude),
    };

    try {
      const result = await requestRide({
        pickup,
        destination,
        distanceInKm: calculateDistanceInKm(pickup, destination),
      });
      navigate(`/rider/rides/${result.ride._id}`);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="page-panel driver-loading">Loading your ride...</main>;

  return (
    <main className="dashboard-grid rider-dashboard">
      <section className="page-panel rider-booking-panel">
        <p className="eyebrow blue-text">Rider dashboard</p>
        <h1>Where are you headed, {user?.fullName}?</h1>
        {activeRide ? (
          <div className="active-ride-notice">
            <div>
              <strong>Your ride is {activeRide.status.replaceAll("_", " ")}.</strong>
              <span>Open tracking to see the latest ride and driver details.</span>
            </div>
            <Link className="btn btn-primary" to={`/rider/rides/${activeRide._id}`}>Continue tracking</Link>
          </div>
        ) : (
          <>
            <p className="muted">Enter both addresses and their coordinates to request a ride.</p>
            <form className="stack" onSubmit={submitRide}>
              {[["pickup", "Pickup"], ["destination", "Destination"]].map(([key, label]) => (
                <fieldset className="location-fields" key={key}>
                  <legend>{label}</legend>
                  <Input
                    label={`${label} address`}
                    value={form[key].address}
                    onChange={(event) => updateLocation(key, "address", event.target.value)}
                    required
                  />
                  <div className="coordinate-grid">
                    <Input
                      label="Latitude"
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      value={form[key].latitude}
                      onChange={(event) => updateLocation(key, "latitude", event.target.value)}
                      required
                    />
                    <Input
                      label="Longitude"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      value={form[key].longitude}
                      onChange={(event) => updateLocation(key, "longitude", event.target.value)}
                      required
                    />
                  </div>
                  {key === "pickup" && (
                    <Button type="button" variant="secondary" disabled={locationBusy} onClick={useCurrentLocation}>
                      {locationBusy ? "Finding location..." : "Use current location"}
                    </Button>
                  )}
                </fieldset>
              ))}
              {error && <p className="form-error" role="alert">{error}</p>}
              <Button type="submit" disabled={submitting}>{submitting ? "Requesting ride..." : "Request ride"}</Button>
            </form>
          </>
        )}
      </section>
      <aside className="page-panel rider-booking-aside">
        <p className="eyebrow green-text">Your ride</p>
        <h2>From request to pickup</h2>
        <p className="muted">Your request is shared with available drivers. Once accepted, their safe contact and vehicle details appear in tracking.</p>
      </aside>
    </main>
  );
}
