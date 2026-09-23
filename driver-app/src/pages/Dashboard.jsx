import { Card, Button } from "shared-ui";
import { useAuth } from "../context/AuthContext";

/**
 * Placeholder home screen. Step 3 (Online/Offline toggle + home dashboard)
 * replaces this with the real thing.
 */
export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Welcome, {user?.name?.split(" ")[0]}
        </h1>
        <Button variant="outline" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>

      <Card>
        <p className="text-neutral-600">
          You're logged in as a driver. Online/offline toggle and incoming ride requests
          land here next.
        </p>
      </Card>
    </div>
  );
}
