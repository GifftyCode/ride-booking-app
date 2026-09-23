import { AdminPage } from "./AdminPage";
import { DriverPage } from "./DriverPage";
import { RiderPage } from "./RiderPage";

export function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Ride Booking App</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        <RiderPage />
        <DriverPage />
        <AdminPage />
      </div>
    </main>
  );
}
