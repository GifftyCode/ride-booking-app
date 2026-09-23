import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Card } from "shared-ui";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { token, user } = await api.signup(form);
      login(token, user);
      // Vehicle info is filled in later, on the profile screen (next milestone)
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
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Become a Driver</h1>
        <p className="text-neutral-600 mb-6">Create your account to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" value={form.name} onChange={update("name")} required />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={update("email")}
            required
          />
          <Input label="Phone" type="tel" value={form.phone} onChange={update("phone")} />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={update("password")}
            required
            minLength={8}
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-sm text-neutral-600 mt-4 text-center">
          Already a driver?{" "}
          <Link to="/login" className="text-primary font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
