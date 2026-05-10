export function parseRatingToFive(input) {
  if (!input) return null;

  const text = String(input).trim();
  const fraction = text.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);

  if (fraction) {
    const score = Number(fraction[1]);
    const scale = Number(fraction[2]);

    if (!Number.isFinite(score) || !Number.isFinite(scale) || scale <= 0) return null;

    return (score / scale) * 5;
  }

  const plainNumber = text.match(/\d+(?:\.\d+)?/);
  if (!plainNumber) return null;

  const score = Number(plainNumber[0]);
  if (!Number.isFinite(score)) return null;

  return score > 5 ? score / 2 : score;
}

export function parsePrice(input) {
  if (!input) return null;

  const match = String(input).match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  const price = Number(match[0]);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function splitListValue(value) {
  return String(value || "")
    .split(/,|\/|\+|&|\band\b/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getTopValues(wines, key, limit = 3) {
  const counts = new Map();

  wines.forEach((wine) => {
    splitListValue(wine[key]).forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function getAverageRating(wines) {
  const ratings = wines.map((wine) => parseRatingToFive(wine.rating)).filter((rating) => rating !== null);

  if (!ratings.length) return null;

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return total / ratings.length;
}

export function getBuyAgainWines(wines) {
  return wines.filter((wine) => String(wine.buyAgain || "").toLowerCase() === "yes");
}

export function getBestValueWines(wines, limit = 3) {
  return wines
    .map((wine) => {
      const rating = parseRatingToFive(wine.rating);
      const price = parsePrice(wine.price);

      if (rating === null || price === null) return null;

      return {
        ...wine,
        ratingScore: rating,
        valueScore: rating / price,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.valueScore - a.valueScore || b.ratingScore - a.ratingScore || String(a.wine || "").localeCompare(String(b.wine || "")))
    .slice(0, limit);
}

export function buildPalateStats(wines) {
  return {
    totalWines: wines.length,
    averageRating: getAverageRating(wines),
    topGrapes: getTopValues(wines, "grape"),
    topRegions: getTopValues(wines, "region"),
    buyAgainWines: getBuyAgainWines(wines),
    bestValueWines: getBestValueWines(wines),
  };
}
