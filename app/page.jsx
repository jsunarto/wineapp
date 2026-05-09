"use client";

import React, { useEffect, useMemo, useState } from "react";
import AutofillBottleInfo from "../components/AutofillBottleInfo";
import BottleInfoSection from "../components/BottleInfoSection";
import { Icons } from "../components/icons";
import SaveStatusMessage from "../components/SaveStatusMessage";
import SheetReadyRow from "../components/SheetReadyRow";
import TastingSections from "../components/TastingSections";
import WineLog from "../components/WineLog";
import { getScanFieldReviews, scanFieldOrder, scanWineLabelReal } from "../lib/scanNormalize";
import { buildSheetRow, createStarterWine, demoWines, INITIAL_LOOKUP_STATUS, toTsv } from "../lib/wineSheet";

export default function WineTastingAppPrototype() {
  const [wine, setWine] = useState(createStarterWine);
  const [wines, setWines] = useState(demoWines);
  const [hasLoadedSavedWines, setHasLoadedSavedWines] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lookupText, setLookupText] = useState("");
  const [lookupStatus, setLookupStatus] = useState(INITIAL_LOOKUP_STATUS);
  const [labelPreview, setLabelPreview] = useState(null);
  const [labelFile, setLabelFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [autofillResult, setAutofillResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [labelInputKey, setLabelInputKey] = useState(0);
  const [scanMode, setScanMode] = useState("Front label");

  useEffect(() => {
    const loadSavedWines = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("wine-log-prototype");
        if (saved) {
          setWines(JSON.parse(saved));
        }
      } catch {
        setWines(demoWines);
      } finally {
        setHasLoadedSavedWines(true);
      }
    }, 0);

    return () => window.clearTimeout(loadSavedWines);
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedWines) return;
    localStorage.setItem("wine-log-prototype", JSON.stringify(wines));
  }, [hasLoadedSavedWines, wines]);

  const row = useMemo(() => buildSheetRow(wine), [wine]);
  const tsv = useMemo(() => toTsv(row), [row]);
  const scanFieldReviews = useMemo(() => getScanFieldReviews(autofillResult, wine), [autofillResult, wine]);

  const update = (key, value) => {
    setWine((prev) => ({ ...prev, [key]: value }));
    setSaveStatus(null);
  };

  const clearLabelPreview = () => {
    setLabelPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return null;
    });
  };

  const resetTastingForm = ({ clearSaveStatus = true } = {}) => {
    setWine(createStarterWine());
    setLookupText("");
    setLookupStatus(INITIAL_LOOKUP_STATUS);
    setLabelFile(null);
    clearLabelPreview();
    setAutofillResult(null);
    setCopied(false);
    setLabelInputKey((key) => key + 1);
    setScanMode("Front label");

    if (clearSaveStatus) {
      setSaveStatus(null);
    }
  };

  const filtered = wines.filter((currentWine) => {
    const haystack = `${currentWine.wine} ${currentWine.region} ${currentWine.country} ${currentWine.grape} ${currentWine.vintage} ${currentWine.buyAgain} ${currentWine.rating}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const saveWine = async () => {
    if (!wine.wine.trim()) {
      setSaveStatus({ type: "error", message: "Add a wine name before saving." });
      return;
    }

    const rowToSave = buildSheetRow(wine);
    setSaveStatus({ type: "saving", message: "Saving tasting note to Google Sheet..." });
    setIsSaving(true);

    try {
      const res = await fetch("/api/save-tasting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rowToSave),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save to Google Sheet.");
      }

      setWines((prev) => [{ ...wine, id: crypto.randomUUID() }, ...prev]);
      resetTastingForm({ clearSaveStatus: false });
      setSaveStatus({ type: "success", message: "Saved to Google Sheet. Ready for your next tasting note." });
    } catch (error) {
      console.error(error);
      setSaveStatus({ type: "error", message: error?.message || "Save failed." });
    } finally {
      setIsSaving(false);
    }
  };

  const copyRow = async () => {
    await navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const runAutofill = async () => {
    setIsScanning(true);
    setSaveStatus(null);
    setLookupStatus(`Scanning ${scanMode.toLowerCase()} with vision...`);
    setAutofillResult(null);

    try {
      const result = await scanWineLabelReal({ imageFile: labelFile, labelText: lookupText, scanMode });
      setAutofillResult(result);

      if (result.status === "matched" || result.status === "uncertain") {
        setLookupStatus("Scan complete. Review the extracted fields, then apply them if they look right.");
      } else {
        setLookupStatus("Could not confidently read the wine label. Try a clearer photo or add manual text.");
      }
    } catch (error) {
      console.error(error);
      setLookupStatus(error?.message || "Scan failed. Check backend logs.");
    } finally {
      setIsScanning(false);
    }
  };

  const applyAutofillResult = () => {
    if (!autofillResult?.fields) return;
    setSaveStatus(null);
    const fields = autofillResult.fields;
    setWine((prev) => {
      const next = { ...prev };

      scanFieldOrder.forEach((key) => {
        if (!String(next[key] || "").trim() && String(fields[key] || "").trim()) {
          next[key] = fields[key];
        }
      });

      if (!next.whereBought) {
        next.whereBought = "Prefilled from label scan; verify manually";
      }

      return next;
    });
    setLookupStatus("Applied only blank bottle fields from the scan. Review any conflicts manually before saving.");
  };

  const handleLabelUpload = (file) => {
    if (!file) return;
    setLabelFile(file);
    clearLabelPreview();
    setLabelPreview(URL.createObjectURL(file));
    setAutofillResult(null);
    setLookupStatus("Photo loaded. Click Scan label to read it with vision.");
  };

  const sectionLinks = [
    ["bottle", "Bottle"],
    ["appearance", "Appearance"],
    ["nose", "Nose"],
    ["palate", "Palate"],
    ["judgment", "Judgment"],
  ];
  const hasSafeScanFields = scanFieldReviews.some((review) => review.isSafeToApply);

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-32 text-slate-900 md:p-8 md:pb-32 lg:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <AutofillBottleInfo
          autofillResult={autofillResult}
          hasSafeScanFields={hasSafeScanFields}
          isScanning={isScanning}
          labelInputKey={labelInputKey}
          labelPreview={labelPreview}
          lookupStatus={lookupStatus}
          lookupText={lookupText}
          onApplyAutofillResult={applyAutofillResult}
          onLabelUpload={handleLabelUpload}
          onLookupTextChange={setLookupText}
          onRunAutofill={runAutofill}
          onScanModeChange={setScanMode}
          scanFieldReviews={scanFieldReviews}
          scanMode={scanMode}
          searchIcon={Icons.search}
        />

        <div className="order-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:order-1">
          <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_.9fr] md:p-8">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {Icons.wine} Wine Learning Prototype
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Guided Wine Tasting Log</h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Capture your tasting note, convert it into your Google Sheet format, and build a searchable memory of wines you actually liked.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-center gap-2 text-sm text-slate-300">{Icons.book} Next skill focus</div>
              <p className="mt-2 text-xl font-semibold">Separate fruitiness from sweetness.</p>
              <p className="mt-2 text-sm text-slate-300">A wine can taste ripe, jammy, or vanilla-sweet while still being technically dry.</p>
            </div>
          </div>
        </div>

        <div className="order-3 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="space-y-4">
            <nav aria-label="Jump to tasting section" className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Jump to</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sectionLinks.map(([id, label]) => (
                  <a key={id} href={`#${id}`} className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
                    {label}
                  </a>
                ))}
              </div>
            </nav>

            <BottleInfoSection icon={Icons.wine} update={update} wine={wine} />
            <TastingSections icons={Icons} update={update} wine={wine} />
          </div>

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <SheetReadyRow
              copied={copied}
              icons={Icons}
              isSaving={isSaving}
              onCopyRow={copyRow}
              onReset={() => resetTastingForm()}
              onSaveWine={saveWine}
              row={row}
              saveStatus={saveStatus}
            />

            <WineLog
              filteredWines={filtered}
              onQueryChange={setQuery}
              onWineSelect={setWine}
              query={query}
              wines={wines}
            />

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="font-semibold">Next step</div>
              <p className="mt-1">Autofill calls your real /api/scan-wine-label route. Save now posts to /api/save-tasting, which should forward the row to your Google Sheet webhook.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-10px_25px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={saveWine}
            disabled={isSaving}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {Icons.save} {isSaving ? "Saving..." : "Save to Sheet"}
          </button>
          <SaveStatusMessage status={saveStatus} compact />
        </div>
      </div>
    </div>
  );
}
