export const INITIAL_LOOKUP_STATUS = "Upload a bottle label or enter label text, then scan.";

export const sheetColumns = [
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

export const starterWine = {
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

export const demoWines = [
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

export function createStarterWine() {
  return {
    ...starterWine,
    dateAdded: new Date().toISOString().slice(0, 10),
  };
}

function joinClean(parts) {
  return parts.filter(Boolean).join("; ");
}

export function normalizeRating(input) {
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

export function buildSheetRow(w) {
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

export function toTsv(row) {
  return sheetColumns.map((column) => row[column] ?? "").join("\t");
}
