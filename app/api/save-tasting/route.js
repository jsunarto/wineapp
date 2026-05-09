export async function POST(req) {
  try {
    const row = await req.json();

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

    if (!webhookUrl || !secret) {
      return Response.json(
        { error: "Missing GOOGLE_SHEETS_WEBHOOK_URL or GOOGLE_SHEETS_WEBHOOK_SECRET in .env.local." },
        { status: 500 }
      );
    }

    const googleRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        // Apps Script web apps are often happier with text/plain than application/json.
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        secret,
        row,
      }),
      redirect: "follow",
    });

    const rawText = await googleRes.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return Response.json(
        {
          error: "Google Apps Script did not return JSON.",
          status: googleRes.status,
          responseText: rawText.slice(0, 1000),
        },
        { status: 500 }
      );
    }

    if (!googleRes.ok || !data.ok) {
      return Response.json(
        {
          error: data.error || "Google Sheet save failed.",
          status: googleRes.status,
          responseText: rawText.slice(0, 1000),
        },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, data });
  } catch (error) {
    console.error("SAVE_TASTING_ERROR:", error);

    return Response.json(
      { error: error?.message || "Failed to save tasting." },
      { status: 500 }
    );
  }
}