/**
 * Shared text input — same field styling everywhere (login forms,
 * ride pickup/dropoff, admin search bars, etc).
 */
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-800 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-md border px-3 py-2.5 text-base outline-none transition-colors
          ${error ? "border-danger" : "border-neutral-200 focus:border-primary"}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
