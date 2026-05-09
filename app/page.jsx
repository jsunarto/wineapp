"use client";

import React, { useMemo, useState, useEffect } from "react";

function Icon({ children, className = "" }) {
  return <span className={`inline-flex h-5 w-5 items-center justify-center ${className}`}>{children}</span>;
}

const Icons = {
  search: <Icon>⌕</Icon>,
  wine: <Icon>🍷</Icon>,
  clipboard: <Icon>📋</Icon>,
  save: <Icon>💾</Icon>,
  reset: <Icon>↺</Icon>,
  star: <Icon>★</Icon>,
  book: <Icon>📘</Icon>,
  check: <Icon>✓</Icon>,
};


const scanModeOptions = ["Front label", "Back label", "Both / additional label"];

const scanModeDescriptions = {
  "Front label": "Looking for wine name, producer/label, region, country, grape, and vintage.",
  "Back label": "Looking for ABV, producer/bottler/importer, and technical label facts.",
  "Both / additional label": "Will merge additional facts into the current bottle fields without overwriting differences automatically.",
};

const scanFieldLabels = {
  wine: "Wine",
  producer: "Producer / Label",
  region: "Region",
  country: "Country",
  grape: "Grape / Blend",
  vintage: "Vintage",
  price: "Price",
  abv: "Listed ABV",
};

const scanFieldOrder = ["wine", "producer", "region", "country", "grape", "vintage", "price", "abv"];

function comparableScanValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getScanFieldReviews(result, currentWine) {
  const fields = result?.fields || {};

  return scanFieldOrder.map((key) => {
    const currentValue = currentWine?.[key] || "";
    const scannedValue = fields[key] || "";
    const hasCurrent = Boolean(String(currentValue).trim());
    const hasScanned = Boolean(String(scannedValue).trim());
    const isConflict = hasCurrent && hasScanned && comparableScanValue(currentValue) !== comparableScanValue(scannedValue);
    const isSafeToApply = !hasCurrent && hasScanned;

    return {
      key,
      label: scanFieldLabels[key] || key,
      currentValue,
      scannedValue,
      confidence: result?.confidence?.[key] || "—",
      status: isConflict ? "needs confirmation" : isSafeToApply ? "safe to apply" : hasScanned ? "already matches or filled" : "not found",
      isConflict,
      isSafeToApply,
    };
  });
}

const sheetColumns = [
  "Date Added",
  "Wine",
  "Region",
  "Country",
  "Grape",
  "Vintage",
  "Price",
  "Appearance",
  "Nose",
  "Palate",
  "Sweetness",
  "Acidity",
  "Tannin",
  "Body",
  "Alcohol",
  "Finish",
  "Food Pairing",
  "Buy Again",
  "Rating",
  "Style",
  "Notes",
  "Source",
  "Expert / Expected Tasting Notes",
  "Critic Score / Source",
];

const INITIAL_LOOKUP_STATUS = "Upload a bottle label or enter label text, then scan.";

const starterWine = {
  dateAdded: new Date().toISOString().slice(0, 10),
  wine: "",
  producer: "",
  region: "",
  country: "",
  grape: "",
  vintage: "",
  price: "",
  whereBought: "",
  appearanceColor: "",
  appearanceClarity: "",
  appearanceIntensity: "",
  noseIntensity: "",
  fruitNotes: "",
  nonFruitNotes: "",
  oakNotes: "",
  flaw: "Clean",
  palateNotes: "",
  sweetness: "Dry",
  perceivedSweetness: false,
  acidity: "Medium",
  tannin: "Medium",
  body: "Medium",
  alcohol: "Medium",
  abv: "",
  texture: "",
  mainFlavors: "",
  oakInfluence: "Light",
  finish: "Medium",
  foodPairing: "",
  avoidPairing: "",
  balance: "Good",
  complexity: "Moderate",
  quality: "Good",
  value: "",
  buyAgain: "Maybe",
  rating: "",
  oneLineMemory: "",
};

function normalizeCountry(country) {
  if (!country) return "";
  const cleaned = country.trim();
  if (["United States", "United States of America", "US", "U.S.", "U.S.A."].includes(cleaned)) {
    return "USA";
  }
  return cleaned;
}

function normalizeScanResult(result) {
  const fields = result?.fields || {};
  const missingFields = [];

  if (!fields.price) missingFields.push("price");
  if (!fields.abv) missingFields.push("abv");
  if (!fields.producer) missingFields.push("producer");

  return {
    ...result,
    fields: {
      wine: fields.wine || "",
      producer: fields.producer || "",
      region: fields.region || "",
      country: normalizeCountry(fields.country || ""),
      grape: fields.grape || "",
      vintage: fields.vintage || "",
      price: fields.price || "",
      abv: fields.abv || "",
    },
    needsUserConfirmation: Array.from(
      new Set([...(result?.needsUserConfirmation || []), ...missingFields])
    ),
  };
}

async function scanWineLabelReal({ imageFile, labelText, scanMode }) {
  if (!imageFile) {
    throw new Error("Choose a bottle label image first.");
  }

  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("labelText", labelText || "");
  formData.append("scanMode", scanMode || "Front label");

  const res = await fetch("/api/scan-wine-label", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || data.error || "Failed to scan wine label");
  }

  return normalizeScanResult(data);
}

const demoWines = [
  {
    id: "demo-1",
    dateAdded: "2026-05-08",
    wine: "Reputation",
    region: "Napa Valley",
    country: "USA",
    grape: "Cabernet Sauvignon",
    vintage: "2023",
    price: "28",
    appearanceColor: "Dark red, nearly black",
    appearanceClarity: "Opaque but clean, no sediment/chunks",
    appearanceIntensity: "Deep / intense",
    noseIntensity: "Medium/pronounced",
    fruitNotes: "Dark plum, dark fruit",
    nonFruitNotes: "Vanilla",
    oakNotes: "Oak",
    flaw: "Unsure",
    palateNotes: "Grippy/chalky texture; dark fruit; medium body; light oak influence",
    sweetness: "Off-dry",
    perceivedSweetness: true,
    acidity: "Medium",
    tannin: "Medium-high; grippy, not super refined",
    body: "Medium",
    alcohol: "High",
    abv: "14.5%",
    texture: "Grippy, chalky",
    mainFlavors: "Dark fruit",
    oakInfluence: "Light",
    finish: "Medium to medium-long; fruit lingers for a few seconds",
    foodPairing: "Steak, burgers, braised beef, lamb, BBQ, rich tomato dishes",
    balance: "Good",
    complexity: "Moderate",
    quality: "Good",
    value: "Good value",
    buyAgain: "Yes",
    rating: "3.9/5",
    oneLineMemory: "Grippy tannins, semi-long finish, and good acid",
  },
];

function joinClean(parts) {
  return parts.filter(Boolean).join("; ");
}

function buildSheetRow(w) {
  const appearance = joinClean([w.appearanceColor, w.appearanceClarity, w.appearanceIntensity]);
  const nose = joinClean([
    w.noseIntensity ? `${w.noseIntensity} aroma intensity` : "",
    w.fruitNotes,
    w.nonFruitNotes,
    w.oakNotes ? `Oak: ${w.oakNotes}` : "",
    w.flaw ? `Condition: ${w.flaw}` : "",
  ]);
  const palate = joinClean([w.palateNotes, w.texture ? `Texture: ${w.texture}` : "", w.mainFlavors, w.oakInfluence ? `Oak influence: ${w.oakInfluence}` : ""]);
  const sweetness = w.perceivedSweetness && w.sweetness === "Dry" ? "Dry, but fruit/oak gives a sweet impression" : w.sweetness;
  const alcohol = joinClean([w.abv, w.alcohol ? `feels ${w.alcohol.toLowerCase()}` : ""]);
  const style = `${w.texture ? `${w.texture}, ` : ""}${w.fruitNotes ? `${w.fruitNotes}, ` : ""}${w.region || ""} ${w.grape || "wine"}`.replace(/,\s*$/, "").trim();
  const notes = joinClean([
    w.value,
    w.oneLineMemory,
    w.whereBought ? `Bought/tasted: ${w.whereBought}` : "",
    w.balance ? `Balance: ${w.balance}` : "",
    w.complexity ? `Complexity: ${w.complexity}` : "",
    w.quality ? `Quality: ${w.quality}` : "",
    w.avoidPairing ? `Avoid pairing with: ${w.avoidPairing}` : "",
  ]);

  return {
    "Date Added": w.dateAdded,
    Wine: w.wine,
    Region: w.region,
    Country: w.country,
    Grape: w.grape,
    Vintage: w.vintage,
    Price: w.price,
    Appearance: appearance,
    Nose: nose,
    Palate: palate,
    Sweetness: sweetness,
    Acidity: w.acidity,
    Tannin: w.tannin,
    Body: w.body,
    Alcohol: alcohol,
    Finish: w.finish,
    "Food Pairing": w.foodPairing,
    "Buy Again": w.buyAgain,
    Rating: normalizeRating(w.rating),
    Style: style,
    Notes: notes,
    Source: "User tasting note",
    "Expert / Expected Tasting Notes": "Not researched yet",
    "Critic Score / Source": "Not researched yet",
  };
}

function normalizeRating(input) {
  if (!input) return "";
  const text = String(input).trim();
  const tenPoint = text.match(/^(\d+(?:\.\d+)?)\s*\/\s*10$/);
  if (tenPoint) return `${Number(tenPoint[1]) / 2}/5`;
  const plainNumber = text.match(/^(\d+(?:\.\d+)?)$/);
  if (plainNumber) {
    const n = Number(plainNumber[1]);
    if (n > 5) return `${n / 2}/5`;
    return `${n}/5`;
  }
  return text;
}

function toTsv(row) {
  return sheetColumns.map((c) => row[c] ?? "").join("\t");
}

function Field({ label, children }) {
  return (
    <label className="space-y-1">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder = "" }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 md:py-2 md:text-sm"
    />
  );
}

function TextArea({ value, onChange, placeholder = "" }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 md:py-2 md:text-sm"
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 md:py-2 md:text-sm"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function Section({ id, title, icon, children }) {
  return (
    <section id={id} className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3 md:mb-4">
        {icon}
        <h2 className="text-base font-semibold text-slate-900 md:text-lg">{title}</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function SaveStatusMessage({ status, compact = false }) {
  const currentStatus = status || {
    type: "idle",
    message: "Ready to save your tasting note when the row looks right.",
  };

  const classNames = {
    idle: "border-slate-200 bg-slate-50 text-slate-600",
    saving: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${compact ? "mt-2 p-2 text-xs" : "mt-3 p-3 text-sm"} rounded-xl border ${classNames[currentStatus.type] || classNames.idle}`}
    >
      <div className="font-medium">
        {currentStatus.type === "idle" && "Idle"}
        {currentStatus.type === "saving" && "Saving"}
        {currentStatus.type === "success" && "Saved successfully"}
        {currentStatus.type === "error" && "Save failed"}
      </div>
      <p className="mt-1">{currentStatus.message}</p>
    </div>
  );
}

function SaveStatusMessage({ status }) {
  const currentStatus = status || {
    type: "idle",
    message: "Ready to save your tasting note when the row looks right.",
  };

  const classNames = {
    idle: "border-slate-200 bg-slate-50 text-slate-600",
    saving: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div role="status" aria-live="polite" className={`mt-3 rounded-xl border p-3 text-sm ${classNames[currentStatus.type]}`}>
      <div className="font-medium">
        {currentStatus.type === "idle" && "Idle"}
        {currentStatus.type === "saving" && "Saving"}
        {currentStatus.type === "success" && "Saved successfully"}
        {currentStatus.type === "error" && "Save failed"}
      </div>
      <p className="mt-1">{currentStatus.message}</p>
    </div>
  );
}

function createStarterWine() {
  return {
    ...starterWine,
    dateAdded: new Date().toISOString().slice(0, 10),
  };
}

function comparableScanValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getScanFieldReviews(result, currentWine) {
  const fields = result?.fields || {};

  return scanFieldOrder.map((key) => {
    const currentValue = currentWine?.[key] || "";
    const scannedValue = fields[key] || "";
    const hasCurrent = Boolean(String(currentValue).trim());
    const hasScanned = Boolean(String(scannedValue).trim());
    const isConflict = hasCurrent && hasScanned && comparableScanValue(currentValue) !== comparableScanValue(scannedValue);
    const isSafeToApply = !hasCurrent && hasScanned;

    return {
      key,
      label: scanFieldLabels[key] || key,
      currentValue,
      scannedValue,
      confidence: result?.confidence?.[key] || "—",
      status: isConflict ? "needs confirmation" : isSafeToApply ? "safe to apply" : hasScanned ? "already matches or filled" : "not found",
      isConflict,
      isSafeToApply,
    };
  });
}

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

  const filtered = wines.filter((w) => {
    const haystack = `${w.wine} ${w.region} ${w.country} ${w.grape} ${w.vintage} ${w.buyAgain} ${w.rating}`.toLowerCase();
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

        <div className="order-1 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:order-2 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
                {Icons.search}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Scan the Label</h2>
              <p className="mt-1 text-sm text-slate-600">Start here on your phone: upload or take a label photo, scan it, then apply the bottle fields.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_.8fr]">
                <div className="space-y-3">
                  <Field label="Scan mode">
                    <Select value={scanMode} onChange={setScanMode} options={scanModeOptions} />
                  </Field>
                  <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{scanModeDescriptions[scanMode]}</p>
                  <Field label="Label text / search terms">
                    <TextInput value={lookupText} onChange={setLookupText} placeholder="Optional hint: Reputation Napa Cabernet 2023" />
                  </Field>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button onClick={runAutofill} disabled={isScanning} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {Icons.search} {isScanning ? "Scanning..." : "Scan label"}
                    </button>
                    <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-base font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50">
                      📷 Upload label
                      <input key={labelInputKey} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleLabelUpload(e.target.files?.[0])} />
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
                            onClick={applyAutofillResult}
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

            <Section id="bottle" title="Bottle Info" icon={Icons.wine}>
              <Field label="Wine"><TextInput value={wine.wine} onChange={(v) => update("wine", v)} placeholder="Reputation" /></Field>
              <Field label="Producer / Label"><TextInput value={wine.producer} onChange={(v) => update("producer", v)} placeholder="Optional" /></Field>
              <Field label="Region"><TextInput value={wine.region} onChange={(v) => update("region", v)} placeholder="Napa Valley" /></Field>
              <Field label="Country"><TextInput value={wine.country} onChange={(v) => update("country", v)} placeholder="USA" /></Field>
              <Field label="Grape / Blend"><TextInput value={wine.grape} onChange={(v) => update("grape", v)} placeholder="Cabernet Sauvignon" /></Field>
              <Field label="Vintage"><TextInput value={wine.vintage} onChange={(v) => update("vintage", v)} placeholder="2023" /></Field>
              <Field label="Price"><TextInput value={wine.price} onChange={(v) => update("price", v)} placeholder="28" /></Field>
              <Field label="Where bought / tasted"><TextInput value={wine.whereBought} onChange={(v) => update("whereBought", v)} placeholder="Costco / Home" /></Field>
              <Field label="Date tasted"><TextInput value={wine.dateAdded} onChange={(v) => update("dateAdded", v)} /></Field>
            </Section>

            <Section id="appearance" title="Appearance" icon={Icons.check}>
              <Field label="Color"><TextInput value={wine.appearanceColor} onChange={(v) => update("appearanceColor", v)} placeholder="Dark red, ruby, gold..." /></Field>
              <Field label="Clear or cloudy?"><TextInput value={wine.appearanceClarity} onChange={(v) => update("appearanceClarity", v)} placeholder="Clear, opaque, cloudy, sediment..." /></Field>
              <Field label="Color depth"><Select value={wine.appearanceIntensity} onChange={(v) => update("appearanceIntensity", v)} options={["", "Pale", "Medium", "Deep", "Deep / intense"]} /></Field>
            </Section>

            <Section id="nose" title="Nose" icon={Icons.search}>
              <Field label="Aroma intensity"><Select value={wine.noseIntensity} onChange={(v) => update("noseIntensity", v)} options={["", "Light", "Medium", "Pronounced", "Medium/pronounced"]} /></Field>
              <Field label="Fruit notes"><TextInput value={wine.fruitNotes} onChange={(v) => update("fruitNotes", v)} placeholder="Dark plum, cherry, lemon..." /></Field>
              <Field label="Non-fruit notes"><TextInput value={wine.nonFruitNotes} onChange={(v) => update("nonFruitNotes", v)} placeholder="Vanilla, earth, spice, mushroom..." /></Field>
              <Field label="Oak notes"><TextInput value={wine.oakNotes} onChange={(v) => update("oakNotes", v)} placeholder="Oak, toast, cedar, smoke..." /></Field>
              <Field label="Any flaw?"><Select value={wine.flaw} onChange={(v) => update("flaw", v)} options={["Clean", "Corked", "Oxidized", "Brett / barnyard", "Unsure"]} /></Field>
            </Section>

            <Section id="palate" title="Palate" icon={Icons.star}>
              <Field label="Sweetness"><Select value={wine.sweetness} onChange={(v) => update("sweetness", v)} options={["Dry", "Off-dry", "Medium-sweet", "Sweet"]} /></Field>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 md:mt-6">
                <input type="checkbox" checked={wine.perceivedSweetness} onChange={(e) => update("perceivedSweetness", e.target.checked)} />
                Fruit/oak gives a sweet impression
              </label>
              <Field label="Acidity"><Select value={wine.acidity} onChange={(v) => update("acidity", v)} options={["Low", "Medium", "Medium-plus", "High"]} /></Field>
              <Field label="Tannin"><TextInput value={wine.tannin} onChange={(v) => update("tannin", v)} placeholder="Medium-high; grippy" /></Field>
              <Field label="Body"><Select value={wine.body} onChange={(v) => update("body", v)} options={["Light", "Light to medium", "Medium", "Medium-plus", "Full"]} /></Field>
              <Field label="Alcohol feel"><Select value={wine.alcohol} onChange={(v) => update("alcohol", v)} options={["Low", "Medium", "Medium-plus", "High"]} /></Field>
              <Field label="Listed ABV"><TextInput value={wine.abv} onChange={(v) => update("abv", v)} placeholder="14.5%" /></Field>
              <Field label="Texture"><TextInput value={wine.texture} onChange={(v) => update("texture", v)} placeholder="Grippy, silky, chalky, creamy..." /></Field>
              <Field label="Main flavors"><TextInput value={wine.mainFlavors} onChange={(v) => update("mainFlavors", v)} placeholder="Dark fruit, vanilla, herbs..." /></Field>
              <Field label="Oak influence"><Select value={wine.oakInfluence} onChange={(v) => update("oakInfluence", v)} options={["None", "Light", "Medium", "Heavy"]} /></Field>
              <Field label="Finish"><TextInput value={wine.finish} onChange={(v) => update("finish", v)} placeholder="Medium-long; fruit lingers" /></Field>
              <Field label="General palate note"><TextArea value={wine.palateNotes} onChange={(v) => update("palateNotes", v)} placeholder="What happened when you tasted it?" /></Field>
            </Section>

            <Section id="judgment" title="Judgment" icon={Icons.save}>
              <Field label="Food pairing"><TextInput value={wine.foodPairing} onChange={(v) => update("foodPairing", v)} placeholder="Steak, lamb, BBQ..." /></Field>
              <Field label="Avoid pairing with"><TextInput value={wine.avoidPairing} onChange={(v) => update("avoidPairing", v)} placeholder="Optional" /></Field>
              <Field label="Balance"><Select value={wine.balance} onChange={(v) => update("balance", v)} options={["Poor", "Okay", "Good", "Excellent"]} /></Field>
              <Field label="Complexity"><Select value={wine.complexity} onChange={(v) => update("complexity", v)} options={["Simple", "Moderate", "Complex"]} /></Field>
              <Field label="Quality"><Select value={wine.quality} onChange={(v) => update("quality", v)} options={["Poor", "Acceptable", "Good", "Very Good", "Excellent", "Outstanding"]} /></Field>
              <Field label="Value for price"><TextInput value={wine.value} onChange={(v) => update("value", v)} placeholder="Good value" /></Field>
              <Field label="Would buy again?"><Select value={wine.buyAgain} onChange={(v) => update("buyAgain", v)} options={["Yes", "Maybe", "No"]} /></Field>
              <Field label="Rating"><TextInput value={wine.rating} onChange={(v) => update("rating", v)} placeholder="3.9/5 or 7.8/10" /></Field>
              <Field label="One-line memory"><TextArea value={wine.oneLineMemory} onChange={(v) => update("oneLineMemory", v)} placeholder="Grippy tannins, semi-long finish, good acid." /></Field>
            </Section>
          </div>

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold">Sheet-ready row</h2>
              <p className="mt-1 text-sm text-slate-600">This mirrors your current Google Sheet columns.</p>
              <div className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {sheetColumns.map((col) => (
                      <tr key={col} className="border-b border-slate-100 last:border-none">
                        <th className="w-40 bg-slate-50 px-3 py-2 align-top text-xs font-semibold text-slate-600">{col}</th>
                        <td className="px-3 py-2 align-top text-slate-800">{row[col]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={copyRow} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
                  {Icons.clipboard} {copied ? "Copied" : "Copy TSV row"}
                </button>
                <button onClick={saveWine} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                  {Icons.save} {isSaving ? "Saving..." : "Save to Sheet"}
                </button>
                <button onClick={() => resetTastingForm()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-50">
                  {Icons.reset} Reset
                </button>
              </div>
              <SaveStatusMessage status={saveStatus} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Wine Log</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{wines.length} wines</span>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span className="text-slate-400">⌕</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search grape, region, rating..."
                  className="w-full text-sm outline-none"
                />
              </div>
              <div className="mt-4 space-y-3">
                {filtered.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWine({ ...createStarterWine(), ...w })}
                    className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{w.wine || "Unnamed wine"}</div>
                        <div className="mt-1 text-sm text-slate-600">{[w.vintage, w.region, w.grape].filter(Boolean).join(" • ")}</div>
                      </div>
                      <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">{normalizeRating(w.rating) || "—"}</div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{w.oneLineMemory || w.palateNotes || "No note yet."}</p>
                    <div className="mt-3 flex gap-2 text-xs text-slate-500">
                      <span>{w.buyAgain}</span>
                      <span>•</span>
                      <span>{w.dateAdded}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
