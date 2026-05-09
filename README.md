# Wine Tasting App

Personal wine-learning app for scanning wine labels, logging tasting notes, and saving structured tasting records to Google Sheets.

## Current MVP Flow

Label photo → OpenAI vision extraction → review scan result → apply bottle fields → fill tasting form → save to Google Sheet.

## Current App Status

- Framework: Next.js with React and Tailwind
- Local folder: `~/Desktop/wine-tasting-app`
- GitHub repo: `https://github.com/jsunarto/wineapp`
- Scanner route: `/api/scan-wine-label`
- Save route: `/api/save-tasting`
- Google Sheet: `Wine Tasted`
- Sheet save is handled through a Google Apps Script webhook

## Environment Variables

Create `.env.local` locally with:

- `OPENAI_API_KEY`
- `GOOGLE_SHEETS_WEBHOOK_URL`
- `GOOGLE_SHEETS_WEBHOOK_SECRET`
- `BASIC_AUTH_USER`
- `BASIC_AUTH_PASSWORD`

Never commit `.env.local`.

## Google Sheet Columns

Date Added, Wine, Region, Country, Grape, Vintage, Price, Appearance, Nose, Palate, Sweetness, Acidity, Tannin, Body, Alcohol, Finish, Food Pairing, Buy Again, Rating, Style, Notes, Source, Expert / Expected Tasting Notes, Critic Score / Source

## Product Principles

This app should teach my own palate, not become another Vivino.

Keep these separate:

1. Bottle facts — from label scan or lookup.
2. My tasting notes — from my own senses.
3. Expert / critic notes — researched separately only when requested.

The scanner should fill bottle facts only. It should not invent tasting impressions.

The user should always review scan results before applying or saving.

## Scan Rules

- Normalize `United States` to `USA`.
- If price is not visible, leave it blank and ask for confirmation.
- If ABV is not visible, leave it blank and ask for confirmation.
- If a front label shows a prominent brand/label but no separate producer, use that name for both Wine and Producer/Label with medium confidence and ask for confirmation.
- Do not include region, grape, or vintage inside the Wine field if they already have separate fields.

## Local Development

Install dependencies:

`npm install`

Run locally:

`npm run dev`

Open:

`http://localhost:3000`

## Deployment Plan

Use Vercel because this app needs Next.js API routes.

Before deploying, configure these Vercel environment variables:

- `OPENAI_API_KEY`
- `GOOGLE_SHEETS_WEBHOOK_URL`
- `GOOGLE_SHEETS_WEBHOOK_SECRET`
- `BASIC_AUTH_USER`
- `BASIC_AUTH_PASSWORD`

## Security Notes

Before public deployment:

- Add Basic Auth middleware.
- Keep OpenAI API key server-side only.
- Keep Google Apps Script secret server-side only.
- Do not expose webhook URL or secret in frontend code.
- Do not commit `.env.local`.

## Near-Term Next Steps

1. Add Basic Auth middleware.
2. Deploy to Vercel.
3. Add Vercel environment variables.
4. Test full flow from phone.
5. Replace alert-based save success with a nicer UI message.
6. Clear label preview and scan result after successful save.
7. Improve mobile UX.
8. Later consider Supabase/Postgres as source of truth, with Google Sheet as export/backup.