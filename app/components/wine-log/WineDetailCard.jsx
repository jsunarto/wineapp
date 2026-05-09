function joinClean(parts) {
  return parts.filter(Boolean).join("; ");
}

function DetailSection({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm text-slate-900">{value || "—"}</div>
    </div>
  );
}

function buildAppearance(wine) {
  return joinClean([wine.appearanceColor, wine.appearanceClarity, wine.appearanceIntensity]);
}

function buildNose(wine) {
  return joinClean([
    wine.noseIntensity ? `${wine.noseIntensity} aroma intensity` : "",
    wine.fruitNotes,
    wine.nonFruitNotes,
    wine.oakNotes ? `Oak: ${wine.oakNotes}` : "",
    wine.flaw ? `Condition: ${wine.flaw}` : "",
  ]);
}

function buildPalate(wine) {
  return joinClean([
    wine.palateNotes,
    wine.texture ? `Texture: ${wine.texture}` : "",
    wine.mainFlavors,
    wine.oakInfluence ? `Oak influence: ${wine.oakInfluence}` : "",
  ]);
}

function buildSweetness(wine) {
  return wine.perceivedSweetness && wine.sweetness === "Dry"
    ? "Dry, but fruit/oak gives a sweet impression"
    : wine.sweetness;
}

export default function WineDetailCard({ wine, onLoadWine, normalizeRating }) {
  if (!wine) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500 shadow-sm">
        Select View details on a saved wine to see the full tasting note without changing the current form.
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wine detail</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{wine.wine || "Unnamed wine"}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {[wine.vintage, wine.producer, wine.region, wine.country].filter(Boolean).join(" • ") || "Saved tasting"}
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          {normalizeRating(wine.rating) || "—"}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <DetailSection title="Bottle facts">
          <div className="grid gap-2 sm:grid-cols-2">
            <DetailItem label="Wine" value={wine.wine} />
            <DetailItem label="Producer" value={wine.producer} />
            <DetailItem label="Region" value={wine.region} />
            <DetailItem label="Country" value={wine.country} />
            <DetailItem label="Grape" value={wine.grape} />
            <DetailItem label="Vintage" value={wine.vintage} />
            <DetailItem label="Price" value={wine.price} />
            <DetailItem label="ABV" value={wine.abv} />
          </div>
        </DetailSection>

        <DetailSection title="User tasting">
          <DetailItem label="Appearance" value={buildAppearance(wine)} />
          <DetailItem label="Nose" value={buildNose(wine)} />
          <DetailItem label="Palate" value={buildPalate(wine)} />
          <div className="grid gap-2 sm:grid-cols-2">
            <DetailItem label="Sweetness" value={buildSweetness(wine)} />
            <DetailItem label="Acidity" value={wine.acidity} />
            <DetailItem label="Tannin" value={wine.tannin} />
            <DetailItem label="Body" value={wine.body} />
            <DetailItem label="Alcohol" value={wine.alcohol} />
            <DetailItem label="Finish" value={wine.finish} />
          </div>
        </DetailSection>

        <DetailSection title="Judgment">
          <div className="grid gap-2 sm:grid-cols-2">
            <DetailItem label="Rating" value={normalizeRating(wine.rating)} />
            <DetailItem label="Buy again" value={wine.buyAgain} />
            <DetailItem label="Value" value={wine.value} />
            <DetailItem label="One-line memory" value={wine.oneLineMemory} />
          </div>
        </DetailSection>

        <DetailSection title="Source">
          <DetailItem label="Tasting source" value="User tasting note" />
        </DetailSection>

        <DetailSection title="Expert notes">
          <DetailItem label="Status" value="Not researched yet" />
        </DetailSection>
      </div>

      <button
        type="button"
        onClick={() => onLoadWine(wine)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Load into form / edit
      </button>
    </article>
  );
}
