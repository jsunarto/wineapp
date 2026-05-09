import { normalizeRating } from "../lib/wineSheet";
import WineDetailCard from "./WineDetailCard";

export default function WineLog({
  filteredWines,
  onQueryChange,
  onWineLoad,
  onWineView,
  query,
  selectedWine,
  wines,
}) {
  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Wine Log</h2>
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
            <div
              key={wine.id}
              className={`w-full rounded-2xl border p-4 text-left transition ${selectedWine?.id === wine.id ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{wine.wine || "Unnamed wine"}</div>
                  <div className="mt-1 text-sm text-slate-600">{[wine.vintage, wine.region, wine.grape].filter(Boolean).join(" • ")}</div>
                </div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{normalizeRating(wine.rating) || "—"}</div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{wine.oneLineMemory || wine.palateNotes || "No note yet."}</p>
              <div className="mt-3 flex gap-2 text-xs text-slate-500">
                <span>{wine.buyAgain}</span>
                <span>•</span>
                <span>{wine.dateAdded}</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onWineView(wine)}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  View details
                </button>
                <button
                  type="button"
                  onClick={() => onWineLoad(wine)}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  Load into form / edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WineDetailCard wine={selectedWine} onLoadWine={onWineLoad} />
    </>
  );
}
