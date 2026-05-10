import { buildSheetRow, createStarterWine, normalizeRating } from "../lib/wineSheet";

function hasValue(value) {
  return String(value ?? "").trim().length > 0;
}

function displayValue(value) {
  return hasValue(value) ? value : "—";
}

function joinValues(values) {
  const cleanValues = values.filter(hasValue);
  return cleanValues.length ? cleanValues.join(" • ") : "—";
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-3 grid gap-3 text-sm text-slate-700">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 leading-6 text-slate-800">{displayValue(value)}</div>
    </div>
  );
}

export default function WineDetailCard({ onLoadWine, wine }) {
  if (!wine) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        Select a saved wine to review its full tasting note without changing the form.
      </div>
    );
  }

  const detailWine = { ...createStarterWine(), ...wine };
  const sheetRow = buildSheetRow(detailWine);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saved tasting detail</div>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{detailWine.wine || "Unnamed wine"}</h2>
          <p className="mt-1 text-sm text-slate-600">{joinValues([detailWine.vintage, detailWine.producer, detailWine.region, detailWine.country])}</p>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">{normalizeRating(detailWine.rating) || "No rating"}</div>
          <button
            type="button"
            onClick={() => onLoadWine(detailWine)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Load into form / edit
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <DetailSection title="Bottle facts">
          <DetailRow label="Grape / blend" value={detailWine.grape} />
          <DetailRow label="Price" value={detailWine.price} />
          <DetailRow label="Where bought / tasted" value={detailWine.whereBought} />
          <DetailRow label="Date tasted" value={detailWine.dateAdded} />
        </DetailSection>

        <DetailSection title="User tasting">
          <DetailRow label="Appearance" value={sheetRow.Appearance} />
          <DetailRow label="Nose" value={sheetRow.Nose} />
          <DetailRow label="Palate" value={sheetRow.Palate} />
          <DetailRow label="Structure" value={joinValues([`Sweetness: ${detailWine.sweetness}`, `Acidity: ${detailWine.acidity}`, `Tannin: ${detailWine.tannin}`, `Body: ${detailWine.body}`, `Alcohol: ${sheetRow.Alcohol}`])} />
          <DetailRow label="Finish" value={detailWine.finish} />
        </DetailSection>

        <DetailSection title="Judgment">
          <DetailRow label="Food pairing" value={detailWine.foodPairing} />
          <DetailRow label="Avoid pairing with" value={detailWine.avoidPairing} />
          <DetailRow label="Balance / complexity / quality" value={joinValues([detailWine.balance, detailWine.complexity, detailWine.quality])} />
          <DetailRow label="Value" value={detailWine.value} />
          <DetailRow label="Would buy again?" value={detailWine.buyAgain} />
          <DetailRow label="One-line memory" value={detailWine.oneLineMemory} />
        </DetailSection>

        <DetailSection title="Source">
          <DetailRow label="Source" value={sheetRow.Source} />
        </DetailSection>

        <DetailSection title="Expert notes">
          <DetailRow label="Expected tasting notes" value={sheetRow["Expert / Expected Tasting Notes"] || "Not researched yet"} />
          <DetailRow label="Critic score / source" value={sheetRow["Critic Score / Source"] || "Not researched yet"} />
        </DetailSection>
      </div>
    </article>
  );
}
