import PalateDashboard from "@/components/PalateDashboard";
import { formatRating, parseRatingValue } from "@/lib/wineStats";

function formatLoggedRating(rating) {
  const parsedRating = parseRatingValue(rating);

  if (parsedRating !== null) {
    return formatRating(parsedRating);
  }

  const rawRating = String(rating || "").trim();
  return rawRating || "—";
}

export default function WineLog({ filteredWines, onQueryChange, onWineSelect, query, wines }) {
  return (
    <>
      <PalateDashboard wines={wines} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="wine-log-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="wine-log-heading" className="text-lg font-semibold">Wine Log</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{wines.length} wines</span>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-slate-400">⌕</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search grape, region, rating..."
            className="w-full text-sm outline-none"
          />
        </div>
        <div className="mt-4 space-y-3">
          {filteredWines.map((wine) => (
            <button
              key={wine.id}
              onClick={() => onWineSelect(wine)}
              className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{wine.wine || "Unnamed wine"}</div>
                  <div className="mt-1 text-sm text-slate-600">{[wine.vintage, wine.region, wine.grape].filter(Boolean).join(" • ")}</div>
                </div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{formatLoggedRating(wine.rating)}</div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{wine.oneLineMemory || wine.palateNotes || "No note yet."}</p>
              <div className="mt-3 flex gap-2 text-xs text-slate-500">
                <span>{wine.buyAgain}</span>
                <span>•</span>
                <span>{wine.dateAdded}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
