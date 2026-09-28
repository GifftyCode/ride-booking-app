import { useAuth } from "../context/AuthContext";

export function DriverDashboardPage() {
  const { user } = useAuth();

  return (
    <main className="dashboard-grid">
      <section className="page-panel dashboard-hero">
        <p className="eyebrow green-text">Driver dashboard</p>
        <h1>Welcome, {user?.fullName}</h1>
        <p className="muted">Your availability and trip controls will live here in the next phase.</p>
        <div className="driver-toggle">
          <span>Availability</span>
          <strong>Offline</strong>
        </div>
        <div className="dashboard-ride-image" aria-hidden="true">
          <img src="/assets/ride-vehicle.webp" alt="" />
        </div>
      </section>
      <aside className="page-panel">
        <p className="eyebrow blue-text">Incoming request</p>
        <div className="request-card">
          <strong>No active ride</strong>
          <span>New requests will appear here once ride matching is added.</span>
        </div>
      </aside>
      <section className="metric-grid wide">
        <div>
          <span>Today earnings</span>
          <strong>NGN 0</strong>
        </div>
        <div>
          <span>Completed trips</span>
          <strong>0</strong>
        </div>
        <div>
          <span>Acceptance rate</span>
          <strong>--</strong>
        </div>
      </section>
    </main>
  );
}
