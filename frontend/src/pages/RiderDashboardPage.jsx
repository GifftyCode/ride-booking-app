import { useAuth } from "../context/AuthContext";

export function RiderDashboardPage() {
  const { user } = useAuth();

  return (
    <main className="dashboard-grid">
      <section className="page-panel dashboard-hero">
        <p className="eyebrow blue-text">Rider dashboard</p>
        <h1>Welcome, {user?.fullName}</h1>
        <p className="muted">Your ride request dashboard will live here in the next phase.</p>
        <div className="quick-form">
          <label className="field">
            <span>Pickup</span>
            <input value="Current location" readOnly />
          </label>
          <label className="field">
            <span>Destination</span>
            <input value="Where to?" readOnly />
          </label>
        </div>
        <div className="dashboard-ride-image" aria-hidden="true">
          <img src="/assets/ride-vehicle.webp" alt="" />
        </div>
      </section>
      <aside className="page-panel">
        <p className="eyebrow green-text">Trip status</p>
        <div className="timeline">
          <span className="active">Requested</span>
          <span>Accepted</span>
          <span>In progress</span>
          <span>Completed</span>
        </div>
      </aside>
      <section className="metric-grid wide">
        <div>
          <span>Saved places</span>
          <strong>0</strong>
        </div>
        <div>
          <span>Completed rides</span>
          <strong>0</strong>
        </div>
        <div>
          <span>Active request</span>
          <strong>None</strong>
        </div>
      </section>
    </main>
  );
}
