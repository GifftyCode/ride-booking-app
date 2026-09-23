export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`rounded-md bg-blue-600 px-4 py-2 font-medium text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
