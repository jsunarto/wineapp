export const scanModeOptions = ["Front label", "Back label", "Both / additional label"];

export const scanModeDescriptions = {
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

export const scanFieldOrder = ["wine", "producer", "region", "country", "grape", "vintage", "price", "abv"];

function comparableScanValue(value) {
  return String(value || "").trim().toLowerCase();
}

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

export function getScanFieldReviews(result, currentWine) {
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

export async function scanWineLabelReal({ imageFile, labelText, scanMode }) {
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
