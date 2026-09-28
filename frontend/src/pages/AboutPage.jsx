export function AboutPage() {
  return (
    <main className="content-page">
      <section className="page-panel split-panel">
        <div>
          <p className="eyebrow blue-text">About</p>
          <h1>Built for real ride workflows</h1>
          <p className="muted">
            This app separates rider accounts, driver accounts, vehicle profiles, protected routes,
            and server-side authentication so later ride matching and trip flows can build on a
            stable base.
          </p>
        </div>
        <div className="status-stack">
          <div>
            <span>Authentication</span>
            <strong>JWT secured</strong>
          </div>
          <div>
            <span>Database</span>
            <strong>MongoDB ready</strong>
          </div>
          <div>
            <span>Roles</span>
            <strong>Rider + Driver</strong>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="info-card">
          <h2>For riders</h2>
          <p>Fast onboarding and a dedicated dashboard prepared for ride requests and history.</p>
        </article>
        <article className="info-card">
          <h2>For drivers</h2>
          <p>Driver accounts include the vehicle data needed for future matching and verification.</p>
        </article>
        <article className="info-card">
          <h2>For the platform</h2>
          <p>Consistent API responses, route protection, seed data and health checks are in place.</p>
        </article>
      </section>
    </main>
  );
}
