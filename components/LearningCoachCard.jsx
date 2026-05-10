export default function LearningCoachCard({ coach, compact = false }) {
  if (!coach) return null;

  const items = [
    ["Good observation", coach.goodObservation],
    ["Watch next time", coach.watchNextTime],
    ["Concept lesson", coach.conceptLesson],
  ];

  return (
    <section aria-label="Post-save learning coach" className={`${compact ? "mt-2 p-3 text-xs" : "mt-3 p-4 text-sm"} rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-950`}>
      <div className="flex items-center gap-2 font-semibold">
        <span aria-hidden="true">💡</span>
        Learning coach
      </div>
      <div className={`${compact ? "mt-2 gap-2" : "mt-3 gap-3"} grid`}>
        {items.map(([label, text]) => (
          <div key={label}>
            <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-indigo-700">{label}</div>
            <p className="mt-1 leading-5 text-indigo-950">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
