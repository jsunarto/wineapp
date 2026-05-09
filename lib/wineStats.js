const UNKNOWN_LABEL = "Unspecified";

export function parseRatingValue(input) {
  if (input === null || input === undefined) return null;

  const text = String(input).trim();
  if (!text) return null;

  const fraction = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (fraction) {
    const score = Number(fraction[1]);
    const scale = Number(fraction[2]);

    if (!Number.isFinite(score) || !Number.isFinite(scale) || scale <= 0) return null;

    return clampRating((score / scale) * 5);
  }

  const percent = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percent) {
    const score = Number(percent[1]);
    if (!Number.isFinite(score)) return null;

    return clampRating(score / 20);
  }

  const numberMatch = text.match(/\d+(?:\.\d+)?/);
  if (!numberMatch) return null;

  const score = Number(numberMatch[0]);
  if (!Number.isFinite(score)) return null;

  if (score > 20) return clampRating(score / 20);
  if (score > 5) return clampRating(score / 2);
  return clampRating(score);
}

export function parsePriceValue(input) {
  if (input === null || input === undefined) return null;

  const text = String(input).replace(/,/g, "").trim();
  if (!text) return null;

  const match = text.match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const price = Number(match[0]);
  return Number.isFinite(price) && price > 0 ? price : null;
}

export function formatRating(value) {
  if (!Number.isFinite(value)) return "—";
  return `${trimTrailingZero(value.toFixed(1))}/5`;
}

export function getWineStats(wines = []) {
  const safeWines = Array.isArray(wines) ? wines : [];
  const ratedWines = safeWines
    .map((wine) => ({ wine, rating: parseRatingValue(wine?.rating) }))
    .filter(({ rating }) => rating !== null);

  const buyAgainWines = safeWines.filter((wine) => isBuyAgain(wine?.buyAgain));
  const bestValueWines = ratedWines
    .map(({ wine, rating }) => ({
      wine,
      rating,
      price: parsePriceValue(wine?.price),
    }))
    .filter(({ price }) => price !== null)
    .map((entry) => ({
      ...entry,
      valueScore: entry.rating / entry.price,
    }))
    .sort((a, b) => b.valueScore - a.valueScore || b.rating - a.rating || a.price - b.price)
    .slice(0, 3);

  const averageRating = ratedWines.length
    ? ratedWines.reduce((sum, { rating }) => sum + rating, 0) / ratedWines.length
    : null;

  return {
    totalWines: safeWines.length,
    averageRating,
    ratedCount: ratedWines.length,
    topGrapes: topCounts(safeWines.flatMap((wine) => splitGrapeField(wine?.grape))),
    topRegions: topCounts(safeWines.map((wine) => normalizeBucket(wine?.region)).filter(Boolean)),
    buyAgainCount: buyAgainWines.length,
    buyAgainWines,
    bestValueWines,
  };
}

function clampRating(value) {
  if (!Number.isFinite(value)) return null;
  return Math.min(Math.max(value, 0), 5);
}

function trimTrailingZero(value) {
  return value.replace(/\.0$/, "");
}

function isBuyAgain(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["yes", "y", "true", "buy again", "would buy again"].includes(normalized);
}

function normalizeBucket(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return text || "";
}

function splitGrapeField(value) {
  const text = normalizeBucket(value);
  if (!text) return [UNKNOWN_LABEL];

  const grapes = text
    .split(/\s*(?:,|;|\/|\+|&|\band\b)\s*/i)
    .map(normalizeBucket)
    .filter(Boolean);

  return grapes.length ? grapes : [text];
}

function topCounts(values, limit = 5) {
  const counts = new Map();

  values.forEach((value) => {
    const normalized = normalizeBucket(value) || UNKNOWN_LABEL;
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);
}
