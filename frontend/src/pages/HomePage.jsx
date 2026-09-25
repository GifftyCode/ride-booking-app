import { AdminPage } from "./AdminPage";
import { DriverPage } from "./DriverPage";
import { RiderPage } from "./RiderPage";

export function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="hero-kicker">Ride Booking MVP</p>
          <h1>Book rides, accept trips, and monitor everything in one place.</h1>
          <p>
            A colorful starter interface for the core flow: request, accept, track, complete.
          </p>
        </div>
        <div className="hero-panel">
          <span>Live flow</span>
          <strong>Request → Accept → Track → Complete</strong>
        </div>
      </section>

      <section className="role-grid">
        <RiderPage />
        <DriverPage />
        <AdminPage />
      </section>
    </main>
  );
}
