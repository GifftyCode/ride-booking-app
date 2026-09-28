import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function HomePage() {
  const { user } = useAuth();

  if (user?.role === "rider") return <Navigate to="/rider/dashboard" replace />;
  if (user?.role === "driver") return <Navigate to="/driver/dashboard" replace />;

  return (
    <main className="home-flow">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">Reliable trips for riders and drivers</p>
          <h1>Book a ride in minutes and keep every trip on track.</h1>
          <p>
            Create a rider or driver account, sign in securely, and land on the dashboard built for
            your role. The app is already connected to the backend authentication flow.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/register">
              Get started
            </Link>
            <Link className="btn btn-secondary" to="/login">
              Sign in
            </Link>
          </div>
        </div>

        <aside className="trip-preview" aria-label="Ride booking preview">
          <div className="hero-ride-image">
            <img src="/assets/ride-vehicle.webp" alt="Blue car ready for a ride" />
            <span className="ride-image-tag">Ready nearby</span>
          </div>
          <div className="trip-card">
            <div>
              <span className="label">Pickup</span>
              <strong>Victoria Island</strong>
            </div>
            <div>
              <span className="label">Destination</span>
              <strong>Lekki Phase 1</strong>
            </div>
            <div className="fare-row">
              <span>Estimated fare</span>
              <strong>NGN 4,500</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="feature-grid">
        <article className="info-card">
          <span className="card-mark blue-mark">01</span>
          <h2>Rider onboarding</h2>
          <p>Create an account, restore your session, and move straight into your rider dashboard.</p>
        </article>
        <article className="info-card">
          <span className="card-mark green-mark">02</span>
          <h2>Driver profiles</h2>
          <p>Driver registration captures vehicle make, model, colour and plate number.</p>
        </article>
        <article className="info-card">
          <span className="card-mark gold-mark">03</span>
          <h2>Protected access</h2>
          <p>Routes are role-aware, so riders and drivers only see the screens meant for them.</p>
        </article>
      </section>

      <section className="workflow-band">
        <div>
          <p className="eyebrow green-text">How it feels</p>
          <h2>Request, match, ride, complete.</h2>
        </div>
        <div className="workflow-steps">
          <span>Choose pickup</span>
          <span>Confirm fare</span>
          <span>Meet driver</span>
          <span>Track status</span>
        </div>
      </section>
    </main>
  );
}
