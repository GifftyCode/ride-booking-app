export function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input className="w-full rounded-md border border-slate-300 px-3 py-2" {...props} />
    </label>
  );
}
