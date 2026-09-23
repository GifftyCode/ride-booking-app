import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function DriverPage() {
  return (
    <Card>
      <h2 className="text-xl font-semibold">Driver console</h2>
      <p className="mt-2 text-slate-600">Go online, accept rides, and update trip status.</p>
      <Button className="mt-4" type="button">Go online</Button>
    </Card>
  );
}
