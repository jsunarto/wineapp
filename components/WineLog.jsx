import { useMemo, useState } from "react";
import { createStarterWine, normalizeRating } from "../lib/wineSheet";
import { buildWineLogFilterOptions, DEFAULT_WINE_LOG_FILTERS, filterAndSortWines, WINE_LOG_SORTS } from "../lib/wineLogFilters";
import WineDetailCard from "./WineDetailCard";

const buyAgainOptions = ["All", "Yes", "Maybe", "No"];

function FilterSelect({ label, onChange, options, value }) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none transition focus:border-slate-400">
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberFilter({ label, maxValue, minValue, onMaxChange, onMinChange, placeholderMax, placeholderMin }) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <input
          aria-label={`${label} minimum`}
          inputMode="decimal"
          step="0.1"
          type="number"
          value={minValue}
          onChange={(event) => onMinChange(event.target.value)}
          placeholder={placeholderMin}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
        />
        <input
          aria-label={`${label} maximum`}
          inputMode="decimal"
          step="0.1"
          type="number"
          value={maxValue}
          onChange={(event) => onMaxChange(event.target.value)}
          placeholder={placeholderMax}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
        />
      </div>
    </fieldset>
  );
}

export default function WineLog({ onLoadWine, onQueryChange, onWineSelect, query, selectedWine, wines }) {
  const [filters, setFilters] = useState(DEFAULT_WINE_LOG_FILTERS);
  const [sort, setSort] = useState("mostRecent");
  const filterOptions = useMemo(() => buildWineLogFilterOptions(wines), [wines]);
  const visibleWines = useMemo(() => filterAndSortWines(wines, { filters, query, sort }), [filters, query, sort, wines]);
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => key !== "buyAgain" && value) || filters.buyAgain !== "All";

  const updateFilter = (key, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_WINE_LOG_FILTERS);
    setSort("mostRecent");
  };

  const clearSearchAndFilters = () => {
    resetFilters();
    onQueryChange("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Wine Log</h2>
            <p className="text-sm text-slate-500">Filter and sort your saved tastings.</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {visibleWines.length}/{wines.length} wines
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-slate-400">⌕</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search grape, region, store, rating..."
            className="w-full text-sm outline-none"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:min-w-48">
              <span>Sort by</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none transition focus:border-slate-400">
                {WINE_LOG_SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" onClick={resetFilters} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              Reset filters
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Buy Again</span>
              <select value={filters.buyAgain} onChange={(event) => updateFilter("buyAgain", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-900 outline-none transition focus:border-slate-400">
                {buyAgainOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <FilterSelect label="Grape" value={filters.grape} onChange={(value) => updateFilter("grape", value)} options={filterOptions.grape || []} />
            <FilterSelect label="Region" value={filters.region} onChange={(value) => updateFilter("region", value)} options={filterOptions.region || []} />
            <FilterSelect label="Country" value={filters.country} onChange={(value) => updateFilter("country", value)} options={filterOptions.country || []} />
            <FilterSelect label="Store / where bought" value={filters.whereBought} onChange={(value) => updateFilter("whereBought", value)} options={filterOptions.whereBought || []} />
            <NumberFilter
              label="Rating range"
              maxValue={filters.ratingMax}
              onMaxChange={(value) => updateFilter("ratingMax", value)}
              minValue={filters.ratingMin}
              onMinChange={(value) => updateFilter("ratingMin", value)}
              placeholderMax="Max /5"
              placeholderMin="Min /5"
            />
            <NumberFilter
              label="Price range"
              maxValue={filters.priceMax}
              onMaxChange={(value) => updateFilter("priceMax", value)}
              minValue={filters.priceMin}
              onMinChange={(value) => updateFilter("priceMin", value)}
              placeholderMax="Max $"
              placeholderMin="Min $"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {visibleWines.length ? (
            visibleWines.map((wine) => (
              <button
                key={wine.id}
                onClick={() => onWineSelect({ ...createStarterWine(), ...wine })}
                className={`w-full rounded-2xl border p-4 text-left transition hover:bg-slate-50 ${selectedWine?.id === wine.id ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{wine.wine || "Unnamed wine"}</div>
                    <div className="mt-1 text-sm text-slate-600">{[wine.vintage, wine.region, wine.country, wine.grape].filter(Boolean).join(" • ")}</div>
                  </div>
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{normalizeRating(wine.rating) || "—"}</div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{wine.oneLineMemory || wine.palateNotes || "No note yet."}</p>
                <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
                  <span>{wine.buyAgain || "Buy again not set"}</span>
                  <span aria-hidden="true">•</span>
                  <span>{wine.price ? `$${String(wine.price).replace(/^\$/, "")}` : "Price not set"}</span>
                  <span aria-hidden="true">•</span>
                  <span>{wine.whereBought || "Store not set"}</span>
                  <span aria-hidden="true">•</span>
                  <span>{wine.dateAdded || "Date not set"}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              <div className="font-medium text-slate-700">No saved wines match your filters.</div>
              <p className="mt-1">Try broadening the search, clearing filters, or choosing a different sort.</p>
              {(query || hasActiveFilters) && (
                <button type="button" onClick={clearSearchAndFilters} className="mt-3 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                  Clear search and filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <WineDetailCard onLoadWine={onLoadWine} wine={selectedWine} />
    </div>
  );
}
