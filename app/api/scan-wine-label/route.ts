import OpenAI from "openai";

export const runtime = "nodejs";

let openaiClient: OpenAI | null = null;
let openaiClientApiKey: string | null = null;

const scanModeInstructions: Record<string, string> = {
  front: "This is the front label. Prioritize the wine name, producer, region, grape/blend, vintage, and visible appellation. Do not infer back-label details like ABV unless visible.",
  back: "This is the back label. Prioritize ABV, importer/fine-print facts, blend details, producer, region, and any clarifying bottle facts. Do not overwrite front-label identity unless the text is explicit.",
  both: "This is an additional label or a combined front/back scan. Use it to fill missing bottle facts and flag any value that may conflict with a previously captured field as needing user confirmation.",
};

function normalizeScanMode(value: FormDataEntryValue | null) {
  const mode = typeof value === "string" ? value : "front";
  return Object.prototype.hasOwnProperty.call(scanModeInstructions, mode) ? mode : "front";
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

export async function POST(req: Request) {
  try {
    const openai = getOpenAIClient();

    if (!openai) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in the server environment." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image");
    const scanMode = normalizeScanMode(formData.get("scanMode"));

    if (!(image instanceof File)) {
      return Response.json(
        { error: "Missing image file. Use FormData field name 'image'." },
        { status: 400 }
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
            "You extract structured wine bottle label information. Use only visible label evidence unless a field is obvious from wine geography. Do not invent tasting notes.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Read this wine bottle label and extract bottle facts.

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
- Do not invent tasting notes.
- Do not guess price unless it is visible.
- Country may be inferred only from clear regions like Napa Valley.
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
      { status: 500 }
    );
  }
}
