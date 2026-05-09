import { scanModeDescriptions, scanModeOptions } from "@/lib/scanNormalize";
import { Field, Select, TextInput } from "@/components/formControls";

export default function AutofillBottleInfo({
  autofillResult,
  hasSafeScanFields,
  isScanning,
  labelInputKey,
  labelPreview,
  lookupStatus,
  lookupText,
  onApplyAutofillResult,
  onLabelUpload,
  onLookupTextChange,
  onRunAutofill,
  onScanModeChange,
  scanFieldReviews,
  scanMode,
  searchIcon,
}) {
  return (
    <div className="order-1 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:order-2 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        {searchIcon}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Scan the Label</h2>
          <p className="mt-1 text-sm text-slate-600">Start here on your phone: upload or take a label photo, scan it, then apply the bottle fields.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_.8fr]">
        <div className="space-y-3">
          <Field label="Scan mode">
            <Select value={scanMode} onChange={onScanModeChange} options={scanModeOptions} />
          </Field>
          <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{scanModeDescriptions[scanMode]}</p>
          <Field label="Label text / search terms">
            <TextInput value={lookupText} onChange={onLookupTextChange} placeholder="Optional hint: Reputation Napa Cabernet 2023" />
          </Field>
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={onRunAutofill} disabled={isScanning} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
              {searchIcon} {isScanning ? "Scanning..." : "Scan label"}
            </button>
            <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-base font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50">
              📷 Upload label
              <input key={labelInputKey} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => onLabelUpload(event.target.files?.[0])} />
            </label>
          </div>
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{lookupStatus}</p>
          <p className="text-xs text-slate-500">Real flow: uploaded image → selected label mode → vision/OCR → extracted bottle facts → review → apply.</p>
          {autofillResult && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Scan result</div>
                  <p className="mt-1 text-sm text-slate-600">{autofillResult.summary}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${autofillResult.status === "matched" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                  {autofillResult.status === "matched" ? "Matched" : "Needs input"}
                </span>
              </div>

              {["matched", "uncertain"].includes(autofillResult.status) && (
                <div className="mt-3 space-y-2">
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    {scanFieldReviews.map((review) => (
                      <div key={review.key} className="grid gap-1 border-b border-slate-100 p-2 text-sm last:border-none md:grid-cols-[110px_1fr_1fr_120px]">
                        <div className="font-medium text-slate-700">{review.label}</div>
                        <div className="text-slate-600">Current: <span className="font-medium text-slate-900">{review.currentValue || "—"}</span></div>
                        <div className="text-slate-600">Scanned: <span className="font-medium text-slate-900">{review.scannedValue || "—"}</span></div>
                        <div className="space-y-1">
                          <div className={`rounded-full px-2 py-1 text-xs font-medium ${review.isConflict ? "bg-amber-100 text-amber-900" : review.isSafeToApply ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                            {review.status}
                          </div>
                          <div className="text-xs text-slate-500">{review.confidence}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-amber-50 p-2 text-xs text-amber-900">
                    Confirm: {autofillResult.needsUserConfirmation.join(", ") || "none"}
                  </div>
                  {autofillResult.rawText && (
                    <div className="rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
                      Read label text: {autofillResult.rawText}
                    </div>
                  )}
                  <button
                    onClick={onApplyAutofillResult}
                    disabled={!hasSafeScanFields}
                    className="mt-1 inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    ✓ Apply safe blank fields
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-sm text-slate-500 md:min-h-36">
          {labelPreview ? <img src={labelPreview} alt="Uploaded wine label preview" className="max-h-64 w-full rounded-xl object-contain md:max-h-56" /> : "Bottle label preview"}
        </div>
      </div>
    </div>
  );
}
