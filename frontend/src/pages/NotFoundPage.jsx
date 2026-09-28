import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="page-panel">
      <p className="eyebrow orange-text">404</p>
      <h1>Page not found</h1>
      <p className="muted">The route you opened does not exist.</p>
      <Link className="btn btn-primary" to="/">
        Go home
      </Link>
    </main>
  );
}
