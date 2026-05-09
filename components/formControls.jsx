export function Field({ label, children }) {
  return (
    <label className="space-y-1">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder = "" }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 md:py-2 md:text-sm"
    />
  );
}

export function TextArea({ value, onChange, placeholder = "" }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 md:py-2 md:text-sm"
    />
  );
}

export function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 md:py-2 md:text-sm"
    >
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

export function Section({ id, title, icon, children }) {
  return (
    <section id={id} className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 md:mb-4">
        {icon}
        <h2 className="text-base font-semibold text-slate-900 md:text-lg">{title}</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}
