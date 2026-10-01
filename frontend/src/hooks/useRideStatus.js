import { useEffect, useState } from "react";
import { getApiError } from "../services/api";
import { getRide } from "../services/rides.service";

export function useRideStatus(rideId) {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  useEffect(() => {
    let mounted = true;
    let inFlight = false;
    let stopPolling = false;
    const controller = new AbortController();

    async function refreshRide() {
      if (inFlight || stopPolling) return;
      inFlight = true;
      try {
        const updatedRide = await getRide(rideId, { signal: controller.signal });
        if (mounted) {
          setRide(updatedRide);
          setError("");
          setNotFound(false);
        }
      } catch (requestError) {
        if (!mounted || controller.signal.aborted) return;
        if (requestError.response?.status === 404) {
          stopPolling = true;
          setRide(null);
          setNotFound(true);
        }
        setError(getApiError(requestError));
      } finally {
        inFlight = false;
        if (mounted) setLoading(false);
      }
    }

    setLoading(true);
    refreshRide();
    const intervalId = window.setInterval(refreshRide, 5000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [rideId]);

  return { ride, loading, error, notFound };
}
