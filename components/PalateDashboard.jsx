import { useMemo } from "react";
import { buildPalateStats } from "../lib/wineStats";

function formatRating(rating) {
  if (rating === null) return "—";
  return `${rating.toFixed(1)}/5`;
}

function formatPrice(price) {
  const text = String(price || "").trim();
  if (!text) return "—";
  return text.startsWith("$") ? text : `$${text}`;
}

function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {detail ? <div className="mt-1 text-sm text-slate-600">{detail}</div> : null}
    </div>
  );
}

function RankedList({ emptyText, items }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <span className="font-medium text-slate-800">{item.label}</span>
          <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function PalateDashboard({ wines }) {
  const stats = useMemo(() => buildPalateStats(wines), [wines]);
  const buyAgainPreview = stats.buyAgainWines.slice(0, 3).map((wine) => wine.wine || "Unnamed wine");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="palate-dashboard-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Personal palate</div>
          <h2 id="palate-dashboard-title" className="text-lg font-semibold text-slate-900">Dashboard</h2>
        </div>
        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">Local only</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total wines" value={stats.totalWines} detail="Saved in this browser" />
        <StatCard label="Average rating" value={formatRating(stats.averageRating)} detail="Normalized to five points" />
        <StatCard label="Buy again" value={stats.buyAgainWines.length} detail={buyAgainPreview.join(", ") || "No yes votes yet"} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Top grapes</h3>
          <div className="mt-3">
            <RankedList emptyText="Add grape details to see patterns." items={stats.topGrapes} />
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Top regions</h3>
          <div className="mt-3">
            <RankedList emptyText="Add regions to see where you keep returning." items={stats.topRegions} />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Best-value wines</h3>
          <span className="text-xs text-slate-300">Rating ÷ price</span>
        </div>
        <div className="mt-3 space-y-2">
          {stats.bestValueWines.length ? (
            stats.bestValueWines.map((wine) => (
              <div key={wine.id || `${wine.wine}-${wine.price}`} className="rounded-xl bg-white/10 px-3 py-2">
                <div className="flex items-start justify-between gap-3 text-sm">
                  <span className="font-medium">{wine.wine || "Unnamed wine"}</span>
                  <span className="text-slate-200">{wine.ratingScore.toFixed(1)}/5 · {formatPrice(wine.price)}</span>
                </div>
                <div className="mt-1 text-xs text-slate-300">{[wine.region, wine.grape].filter(Boolean).join(" • ") || "Add region and grape details"}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-300">Add both a rating and price to rank value picks.</p>
          )}
        </div>
      </div>
    </section>
  );
}
