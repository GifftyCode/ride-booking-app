import { Card } from "../components/Card";

export function AdminPage() {
  return (
    <Card>
      <h2 className="text-xl font-semibold">Admin dashboard</h2>
      <p className="mt-2 text-slate-600">Manage customers, drivers, rides, and analytics.</p>
    </Card>
  );
}
