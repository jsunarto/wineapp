import { formatRating, getWineStats } from "@/lib/wineStats";

function StatTile({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      {detail && <div className="mt-1 text-xs text-slate-500">{detail}</div>}
    </div>
  );
}

function CountList({ items, emptyText }) {
  if (!items.length) {
    return <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <span className="font-medium text-slate-800">{item.name}</span>
          <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function WineMiniList({ wines, emptyText, renderMeta }) {
  if (!wines.length) {
    return <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {wines.map((entry) => {
        const wine = entry.wine || entry;
        const key = wine.id || `${wine.wine}-${wine.vintage}-${wine.region}`;

        return (
          <div key={key} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
            <div className="font-medium text-slate-900">{wine.wine || "Unnamed wine"}</div>
            <div className="mt-0.5 text-xs text-slate-500">
              {[wine.vintage, wine.region, wine.grape].filter(Boolean).join(" • ") || "No bottle details"}
            </div>
            {renderMeta && <div className="mt-1 text-xs font-medium text-slate-600">{renderMeta(entry)}</div>}
          </div>
        );
      })}
    </div>
  );
}

export default function PalateDashboard({ wines }) {
  const stats = getWineStats(wines);
  const hasWines = stats.totalWines > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="palate-dashboard-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="palate-dashboard-heading" className="text-lg font-semibold text-slate-900">Personal Palate Dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">A local-only snapshot of patterns from your saved wine log.</p>
        </div>
        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">Local</span>
      </div>

      {!hasWines && (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          Save your first tasting note to start building your palate dashboard.
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatTile label="Wines logged" value={stats.totalWines} />
        <StatTile
          label="Average rating"
          value={stats.averageRating === null ? "—" : formatRating(stats.averageRating)}
          detail={stats.ratedCount ? `${stats.ratedCount} rated wine${stats.ratedCount === 1 ? "" : "s"}` : "No usable ratings yet"}
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Top grapes</h3>
          <CountList items={stats.topGrapes} emptyText="Add grape details to see favorites." />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Top regions</h3>
          <CountList items={stats.topRegions} emptyText="Add regions to see where your tastes cluster." />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-700">Buy again</h3>
          <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">{stats.buyAgainCount}</span>
        </div>
        <WineMiniList wines={stats.buyAgainWines.slice(0, 3)} emptyText="No definite buy-again wines yet." />
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Best value</h3>
        <WineMiniList
          wines={stats.bestValueWines}
          emptyText="Add price and rating to identify strong values."
          renderMeta={(entry) => `${formatRating(entry.rating)} • $${entry.price.toFixed(2)}`}
        />
      </div>
    </section>
  );
}
