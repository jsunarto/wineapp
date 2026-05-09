import OpenAI from "openai";

export const runtime = "nodejs";

let openaiClient: OpenAI | null = null;
let openaiClientApiKey: string | null = null;

const scanModeInstructions: Record<string, string> = {
  "Front label": "This is the front label. Prioritize the wine name, producer, region, grape/blend, vintage, and visible appellation. Do not infer back-label details like ABV unless visible.",
  "Back label": "This is the back label. Prioritize ABV, importer/fine-print facts, blend details, producer, region, and any clarifying bottle facts. Do not overwrite front-label identity unless the text is explicit.",
  "Both / additional label": "This is an additional label or a combined front/back scan. Use it to fill missing bottle facts and flag any value that may conflict with a previously captured field as needing user confirmation.",
};

const scanModeAliases: Record<string, string> = {
  front: "Front label",
  back: "Back label",
  both: "Both / additional label",
};

function normalizeScanMode(value: FormDataEntryValue | null) {
  const mode = typeof value === "string" ? value : "Front label";
  const normalizedMode = scanModeAliases[mode] || mode;
  return Object.prototype.hasOwnProperty.call(scanModeInstructions, normalizedMode) ? normalizedMode : "Front label";
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!openaiClient || openaiClientApiKey !== apiKey) {
    openaiClient = new OpenAI({ apiKey });
    openaiClientApiKey = apiKey;
  }

  return openaiClient;
}

function normalizeScanMode(value: FormDataEntryValue | null) {
  const scanMode = typeof value === "string" ? value : "Front label";

  if (
    ["Front label", "Back label", "Both / additional label"].includes(scanMode)
  ) {
    return scanMode;
  }

  return "Front label";
}

function scanModePrompt(scanMode: string) {
  if (scanMode === "Back label") {
    return "Scan mode: Back label. Prioritize visible ABV, producer, bottler, importer, country, region, and technical label text. Put bottler/importer or other technical facts in sourceNote if they do not fit a field.";
  }

  if (scanMode === "Both / additional label") {
    return "Scan mode: Both / additional label. Extract all visible bottle facts and do not invent missing values. Treat this as additional evidence that may be merged into existing bottle fields.";
  }

  return "Scan mode: Front label. Prioritize wine name, producer/label, region, country, grape, and vintage.";
}

export async function POST(req: Request) {
  try {
    const openai = getOpenAIClient();

    if (!openai) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in the server environment." },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const image = formData.get("image");
    const scanMode = normalizeScanMode(formData.get("scanMode"));

    if (!(image instanceof File)) {
      return Response.json(
        { error: "Missing image file. Use FormData field name 'image'." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const base64 = bytes.toString("base64");
    const mimeType = image.type || "image/jpeg";

    const response = await openai.responses.create({
      model: "gpt-5.1",
      input: [
        {
          role: "system",
          content:
            "You extract structured wine bottle label information. Use only visible label evidence unless a field is obvious from wine geography. Do not invent tasting notes, critic notes, appearance, nose, palate, sweetness, acidity, tannin, body, alcohol feel, finish, ratings, or buy-again judgments.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Read this wine bottle label and extract bottle facts.
${scanModePrompt(scanMode)}

Return ONLY valid JSON with this exact shape:
{
  "status": "matched | uncertain | no_match",
  "summary": "",
  "rawText": "",
  "fields": {
    "wine": "",
    "producer": "",
    "region": "",
    "country": "",
    "grape": "",
    "vintage": "",
    "price": "",
    "abv": ""
  },
  "confidence": {
    "wine": "High | Medium | Low | Unknown",
    "producer": "High | Medium | Low | Unknown",
    "region": "High | Medium | Low | Unknown",
    "country": "High | Medium | Low | Unknown",
    "grape": "High | Medium | Low | Unknown",
    "vintage": "High | Medium | Low | Unknown",
    "price": "High | Medium | Low | Unknown",
    "abv": "High | Medium | Low | Unknown"
  },
  "needsUserConfirmation": [],
  "sourceNote": ""
}

Scan context:
- ${scanModeInstructions[scanMode]}

Rules:
- wine = the short wine/label name only. Do not include region, grape, or vintage if they have separate fields.
- Extract only bottle facts.
- Do not invent tasting notes, critic notes, scores, appearance, nose, palate, sweetness, acidity, tannin, body, alcohol feel, finish, ratings, or buy-again judgments.
- Do not guess price unless it is visible.
- Keep missing price or ABV listed in needsUserConfirmation when not visible.
- Country may be inferred only from clear regions like Napa Valley.
- Normalize United States, United States of America, US, U.S., and U.S.A. to USA.
- If a front label shows a prominent brand/label but no separate producer, use that brand/label for both wine and producer with Medium confidence and include producer in needsUserConfirmation.
- If a field is not visible, leave it blank and mark confidence Unknown.
              `.trim(),
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${base64}`,
              detail: "high",
            },
          ],
        },
      ],
    });

    const parsed = JSON.parse(response.output_text.trim());
    return Response.json(parsed);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to scan wine label." },
      { status: 500 },
    );
  }
}
