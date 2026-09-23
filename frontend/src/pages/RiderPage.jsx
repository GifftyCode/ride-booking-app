import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

export function RiderPage() {
  return (
    <Card>
      <h2 className="text-xl font-semibold">Request a ride</h2>
      <form className="mt-4 space-y-3">
        <Input label="Pickup" placeholder="Enter pickup address" />
        <Input label="Drop-off" placeholder="Enter destination" />
        <Button type="button">Request ride</Button>
      </form>
    </Card>
  );
}
