/**
 * Shared Button — the only button component that should exist in this project.
 * Import it instead of writing <button className="..."> from scratch in an app.
 *
 * Usage:
 *   import { Button } from "shared-ui";
 *   <Button variant="primary">Request Ride</Button>
 *   <Button variant="danger">Cancel</Button>
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-white hover:bg-secondary-dark",
    danger: "bg-danger text-white hover:opacity-90",
    outline: "border border-neutral-200 text-neutral-800 hover:bg-neutral-50",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2.5",
    lg: "text-lg px-6 py-3",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
