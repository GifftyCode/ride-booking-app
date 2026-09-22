/**
 * Shared Card — the base container used for ride cards, driver cards,
 * admin list rows, dashboard stat blocks, etc.
 */
export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-lg border border-neutral-200 shadow-sm p-4 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Shared StatusBadge — renders a ride/driver status with the correct
 * color automatically, so "completed" is always green and "cancelled"
 * is always red no matter which app renders it.
 */
const STATUS_STYLES = {
  requested: "bg-warning-light text-warning",
  accepted: "bg-primary-light text-primary",
  driver_arriving: "bg-primary-light text-primary",
  in_progress: "bg-primary-light text-primary",
  completed: "bg-secondary-light text-secondary",
  cancelled: "bg-danger-light text-danger",
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-neutral-100 text-neutral-600";
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style}`}
    >
      {label}
    </span>
  );
}
