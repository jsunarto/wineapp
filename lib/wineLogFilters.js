import { parsePrice, parseRatingToFive } from "./wineStats";

export const DEFAULT_WINE_LOG_FILTERS = {
  buyAgain: "All",
  grape: "",
  region: "",
  country: "",
  ratingMin: "",
  ratingMax: "",
  priceMin: "",
  priceMax: "",
  whereBought: "",
};

export const WINE_LOG_SORTS = [
  { value: "mostRecent", label: "Most recent" },
  { value: "highestRated", label: "Highest rated" },
  { value: "bestValue", label: "Best value" },
  { value: "priceLowHigh", label: "Price low to high" },
  { value: "priceHighLow", label: "Price high to low" },
  { value: "buyAgainFirst", label: "Buy-again first" },
];

const BUY_AGAIN_RANK = {
  yes: 3,
  maybe: 2,
  no: 1,
};

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeForCompare(value) {
  return normalizeText(value).toLowerCase();
}

function getNumericFilterValue(value) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getDateTime(wine) {
  const timestamp = Date.parse(wine.dateAdded || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getBuyAgainRank(wine) {
  return BUY_AGAIN_RANK[normalizeForCompare(wine.buyAgain)] || 0;
}

function compareNumbersWithMissing(a, b, direction = "desc") {
  const aMissing = a === null;
  const bMissing = b === null;

  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;

  return direction === "asc" ? a - b : b - a;
}

function compareMostRecent(a, b) {
  const dateCompare = getDateTime(b.wine) - getDateTime(a.wine);
  return dateCompare || a.index - b.index;
}

function compareFallback(a, b) {
  return compareMostRecent(a, b) || String(a.wine.wine || "").localeCompare(String(b.wine.wine || ""));
}

export function buildWineLogFilterOptions(wines) {
  const fields = ["grape", "region", "country", "whereBought"];

  return fields.reduce((options, field) => {
    const labelsByKey = new Map();

    wines.forEach((wine) => {
      const label = normalizeText(wine[field]);
      if (!label) return;

      const key = label.toLowerCase();
      if (!labelsByKey.has(key)) {
        labelsByKey.set(key, label);
      }
    });

    options[field] = [...labelsByKey.values()].sort((a, b) => a.localeCompare(b));
    return options;
  }, {});
}

export function wineMatchesSearch(wine, query) {
  const normalizedQuery = normalizeForCompare(query);
  if (!normalizedQuery) return true;

  const haystack = [
    wine.wine,
    wine.producer,
    wine.region,
    wine.country,
    wine.grape,
    wine.vintage,
    wine.buyAgain,
    wine.rating,
    wine.price,
    wine.whereBought,
    wine.oneLineMemory,
    wine.palateNotes,
  ]
    .map(normalizeForCompare)
    .join(" ");

  return haystack.includes(normalizedQuery);
}

export function wineMatchesFilters(wine, filters) {
  if (filters.buyAgain !== "All" && normalizeForCompare(wine.buyAgain) !== normalizeForCompare(filters.buyAgain)) {
    return false;
  }

  for (const field of ["grape", "region", "country", "whereBought"]) {
    if (filters[field] && normalizeForCompare(wine[field]) !== normalizeForCompare(filters[field])) {
      return false;
    }
  }

  const rating = parseRatingToFive(wine.rating);
  const ratingMin = getNumericFilterValue(filters.ratingMin);
  const ratingMax = getNumericFilterValue(filters.ratingMax);

  if (ratingMin !== null && (rating === null || rating < ratingMin)) return false;
  if (ratingMax !== null && (rating === null || rating > ratingMax)) return false;

  const price = parsePrice(wine.price);
  const priceMin = getNumericFilterValue(filters.priceMin);
  const priceMax = getNumericFilterValue(filters.priceMax);

  if (priceMin !== null && (price === null || price < priceMin)) return false;
  if (priceMax !== null && (price === null || price > priceMax)) return false;

  return true;
}

export function filterAndSortWines(wines, { filters = DEFAULT_WINE_LOG_FILTERS, query = "", sort = "mostRecent" } = {}) {
  const enriched = wines
    .map((wine, index) => ({
      index,
      wine,
      price: parsePrice(wine.price),
      rating: parseRatingToFive(wine.rating),
    }))
    .filter(({ wine }) => wineMatchesSearch(wine, query) && wineMatchesFilters(wine, filters));

  return enriched
    .sort((a, b) => {
      if (sort === "highestRated") {
        return compareNumbersWithMissing(a.rating, b.rating) || compareFallback(a, b);
      }

      if (sort === "bestValue") {
        const aValue = a.rating !== null && a.price !== null ? a.rating / a.price : null;
        const bValue = b.rating !== null && b.price !== null ? b.rating / b.price : null;
        return compareNumbersWithMissing(aValue, bValue) || compareNumbersWithMissing(a.rating, b.rating) || compareFallback(a, b);
      }

      if (sort === "priceLowHigh") {
        return compareNumbersWithMissing(a.price, b.price, "asc") || compareFallback(a, b);
      }

      if (sort === "priceHighLow") {
        return compareNumbersWithMissing(a.price, b.price) || compareFallback(a, b);
      }

      if (sort === "buyAgainFirst") {
        return getBuyAgainRank(b.wine) - getBuyAgainRank(a.wine) || compareFallback(a, b);
      }

      return compareMostRecent(a, b);
    })
    .map(({ wine }) => wine);
}
