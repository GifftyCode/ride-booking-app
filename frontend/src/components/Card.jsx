export function Card({ children, className = "" }) {
  return (
    <section className={`rounded-md border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </section>
  );
}
