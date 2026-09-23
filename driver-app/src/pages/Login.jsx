import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Card } from "shared-ui";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { token, user } = await api.login(email, password);
      if (user.role !== "driver") {
        throw new Error("This account isn't registered as a driver.");
      }
      login(token, user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Driver Login</h1>
        <p className="text-neutral-600 mb-6">Sign in to start accepting rides.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-neutral-600 mt-4 text-center">
          New driver?{" "}
          <Link to="/signup" className="text-primary font-medium">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
