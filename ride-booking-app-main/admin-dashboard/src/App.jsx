import { Button, Card, StatusBadge } from "shared-ui";

/**
 * Starter screen — replace with your real screens.
 * This just proves shared-ui is wired up correctly:
 * if the button is blue and rounded, the design system is working.
 */
export default function App() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-4">Admin Dashboard</h1>
      <Card className="max-w-sm">
        <p className="text-neutral-600 mb-3">
          shared-ui is connected. Build your screens here.
        </p>
        <StatusBadge status="requested" />
        <div className="mt-4">
          <Button variant="primary">Example Button</Button>
        </div>
      </Card>
    </div>
  );
}
