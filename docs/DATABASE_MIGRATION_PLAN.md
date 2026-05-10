# Database Migration Plan

## Purpose and scope

This document plans a future migration from the current browser-local wine log plus Google Sheets export flow to a durable database-backed architecture. It is planning only: it does not introduce a database, alter app behavior, modify API routes, change Google Sheet save behavior, or add/change environment variables.

## 1. Current state

### Browser wine log in `localStorage`

- The tasting form and in-app wine log are client-side state.
- Saved wines are loaded from `localStorage` under the `wine-log-prototype` key after the page mounts.
- When the user saves a tasting successfully, the app prepends the new wine to the local in-browser log and persists that log back to `localStorage`.
- This makes the current log fast and simple, but it is device/browser-specific and not a durable source of truth.

### Google Sheet save and export

- The app builds a Sheet-ready row from the tasting form fields.
- Users can copy a tab-separated row for manual sheet workflows.
- The primary save action posts the row to `/api/save-tasting`.
- The save route forwards the row to a Google Apps Script webhook using server-side Google Sheets configuration.
- The Google Sheet remains the main durable record/export target in the current MVP.

### OpenAI scan routes

- Label scan/autofill is routed through `/api/scan-wine-label`.
- The client sends label text and/or an uploaded label image to the app route.
- The server route uses the OpenAI API key from the server environment and returns normalized bottle facts for user review.
- Scan output should continue to be treated as untrusted draft data until the user reviews and applies it.

### Basic Auth

- Basic Auth protects the app and API routes via the Next.js proxy.
- Credentials are checked against server-side `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD` values.
- Static assets and Next.js internals are excluded from the auth matcher.
- This is appropriate for a small private MVP but should be replaced with user-aware authentication before storing per-user database records.

## 2. Why migrate later

A database should be introduced when the app needs capabilities that are awkward or fragile with localStorage plus Google Sheets:

- **Cross-device sync:** the same user should see tasting history from phone, laptop, and future devices.
- **Durable history:** tasting notes should survive browser resets, device loss, cache clearing, and private browsing limitations.
- **Image storage:** label photos need private object storage, metadata, lifecycle rules, and links back to scans/tastings.
- **Better queries:** the app will eventually need filtering by grape, region, style, rating, price, buy-again intent, tasting traits, and scan confidence.
- **Recommendations:** structured history can power personalized recommendations, similar-wine discovery, cellar/shopping suggestions, and palate-learning insights.

The current MVP should continue with Google Sheets until there is enough usage and data complexity to justify the migration cost.

## 3. Recommended option

### Likely default: Supabase/Postgres

Supabase backed by Postgres is the recommended default for a future migration because it combines a relational database, authentication, row-level security, object storage, migrations, and a TypeScript-friendly client/server SDK in one hosted platform. It is a good fit for structured wine/tasting data, private label images, and incremental adoption while keeping Google Sheets as an export/backup layer.

### Comparison

| Option | Strengths | Tradeoffs | Recommendation |
| --- | --- | --- | --- |
| Supabase/Postgres | Relational model, SQL, hosted Postgres, Auth, Storage, Row-Level Security, useful dashboard, easy Vercel integration. | Adds platform dependency and requires careful RLS/auth design. | Preferred default when migration begins. |
| Plain Postgres | Maximum portability and standard SQL; can run on many providers. | Requires separate auth, storage, admin tooling, connection pooling, backups, and security rules. | Good if platform control becomes more important than speed. |
| Firebase | Strong client SDKs, realtime sync, auth, and storage. | Document data model is less natural for relational wine/tasting queries and reporting; query patterns need more denormalization. | Consider only if realtime-first UX becomes the dominant requirement. |
| Stay on Google Sheets | Very simple, transparent, familiar, and already works for export/reporting. | Not ideal as source of truth for auth, cross-device app reads, image storage, relational queries, or recommendations. | Keep as export/backup/reporting, not long-term source of truth. |

## 4. Proposed schema

The initial schema should be normalized enough to support history, scanning, recommendations, and exports without overfitting. Field names below are intentionally draft-level and should be finalized in a schema migration issue.

### `users`

Represents an authenticated app user.

- `id` UUID primary key, ideally matching the auth provider user id.
- `email` text, unique when email login is used.
- `display_name` text nullable.
- `created_at` timestamptz.
- `updated_at` timestamptz.

### `wines`

Represents stable bottle/wine identity and facts that can be reused across tastings.

- `id` UUID primary key.
- `created_by` UUID references `users(id)`.
- `name` text.
- `producer` text nullable.
- `region` text nullable.
- `country` text nullable.
- `grape` text nullable.
- `vintage` text nullable or integer nullable, depending on import cleanliness.
- `style` text nullable.
- `price` numeric nullable.
- `abv` numeric nullable.
- `source` text nullable, such as manual entry, label scan, import, or researched lookup.
- `created_at` timestamptz.
- `updated_at` timestamptz.

### `tastings`

Represents one user's tasting experience for a wine at a point in time.

- `id` UUID primary key.
- `user_id` UUID references `users(id)`.
- `wine_id` UUID references `wines(id)`.
- `date_added` date or timestamptz.
- `appearance` text nullable.
- `nose` text nullable.
- `palate` text nullable.
- `sweetness` text nullable.
- `acidity` text nullable.
- `tannin` text nullable.
- `body` text nullable.
- `alcohol` text nullable.
- `finish` text nullable.
- `food_pairing` text nullable.
- `buy_again` text nullable or boolean nullable, depending on current values.
- `rating` numeric nullable.
- `notes` text nullable.
- `sheet_row_snapshot` jsonb nullable, preserving the exact exported row shape during migration.
- `created_at` timestamptz.
- `updated_at` timestamptz.

### `label_scans`

Represents each scan/autofill attempt and its extracted bottle facts.

- `id` UUID primary key.
- `user_id` UUID references `users(id)`.
- `wine_id` UUID nullable references `wines(id)`.
- `tasting_id` UUID nullable references `tastings(id)`.
- `scan_mode` text, for example front label or back label.
- `input_text` text nullable.
- `model` text nullable.
- `status` text, such as matched, uncertain, or failed.
- `extracted_fields` jsonb.
- `field_confidence` jsonb nullable.
- `needs_user_confirmation` jsonb nullable.
- `error_message` text nullable.
- `created_at` timestamptz.

### `expert_notes`

Represents researched expert/critic notes kept separate from the user's own tasting notes.

- `id` UUID primary key.
- `wine_id` UUID references `wines(id)`.
- `created_by` UUID references `users(id)`.
- `expected_tasting_notes` text nullable.
- `critic_score` text nullable.
- `critic_source` text nullable.
- `source_url` text nullable.
- `retrieved_at` timestamptz nullable.
- `created_at` timestamptz.
- `updated_at` timestamptz.

### `shopping_candidates`

Represents wines the user may want to buy, taste, or compare later.

- `id` UUID primary key.
- `user_id` UUID references `users(id)`.
- `wine_id` UUID nullable references `wines(id)`.
- `name` text.
- `producer` text nullable.
- `region` text nullable.
- `country` text nullable.
- `grape` text nullable.
- `vintage` text nullable.
- `price` numeric nullable.
- `merchant` text nullable.
- `merchant_url` text nullable.
- `reason` text nullable, such as recommendation, manual add, or similar to liked wine.
- `status` text, such as candidate, purchased, tasted, skipped, or archived.
- `created_at` timestamptz.
- `updated_at` timestamptz.

### `label_photos`

Represents private stored label images and links them to scans, wines, and tastings.

- `id` UUID primary key.
- `user_id` UUID references `users(id)`.
- `wine_id` UUID nullable references `wines(id)`.
- `tasting_id` UUID nullable references `tastings(id)`.
- `label_scan_id` UUID nullable references `label_scans(id)`.
- `storage_bucket` text.
- `storage_path` text.
- `content_type` text nullable.
- `byte_size` integer nullable.
- `width` integer nullable.
- `height` integer nullable.
- `uploaded_at` timestamptz.
- `deleted_at` timestamptz nullable for soft-delete or retention workflows.

## 5. What remains in Google Sheets

Google Sheets should remain valuable after the database becomes source of truth:

- **Export:** keep generating the existing sheet columns for manual review and familiar spreadsheet workflows.
- **Backup:** optionally write or periodically export rows as a human-readable backup outside the database.
- **Reporting:** keep Sheets available for pivot tables, sharing, charts, and lightweight analysis.
- **Compatibility:** preserve the current row shape until users and downstream workflows have migrated.

After migration, app reads and writes should eventually use Supabase/Postgres as the source of truth, while Google Sheets becomes a derived export target rather than the canonical record.

## 6. Migration strategy

### Import existing Google Sheet rows

1. Export the current `Wine Tasted` sheet as CSV or read it through a controlled server-side import script.
2. Map sheet columns to `wines`, `tastings`, and `expert_notes`:
   - Bottle facts map mostly to `wines`.
   - Personal tasting fields map to `tastings`.
   - Expert/critic columns map to `expert_notes`.
3. Preserve the original row in `tastings.sheet_row_snapshot` during the first import to avoid losing data due to mapping mistakes.
4. Deduplicate cautiously. Prefer creating separate `wines` records over aggressive merging until duplicate rules are reviewed.
5. Run import in a dry-run mode first, report counts and unmapped fields, then perform the final import.

### Preserve `localStorage` data if needed

- Add an explicit one-time client-side export/import step if users may have records in localStorage that were not saved to Google Sheets.
- Compare localStorage entries against imported sheet/database records using wine name, vintage, date, and notes.
- Let the user review conflicts instead of silently overwriting.
- Keep localStorage read-only fallback during the transition window, then remove it in a later cleanup issue.

### Keep backward compatibility during transition

- Do not remove the current Google Sheet save route when database writes are introduced.
- Start with a parallel write path: save to the database and keep exporting/saving the same row shape to Google Sheets.
- Add observability around mismatches between database records and Sheet rows.
- Migrate reads only after database writes are proven reliable.
- Provide a rollback path that can temporarily restore Google Sheets/localStorage as the operational flow if needed.

## 7. Security considerations

### Auth migration

- Replace Basic Auth with user-aware authentication before storing multi-user records.
- Supabase Auth is the likely default if Supabase is selected.
- Map each authenticated user to `users.id` and ensure all user-owned tables include `user_id` or an equivalent owner column.
- Define account recovery, session lifetime, and device logout behavior before launch.

### API key handling

- Keep OpenAI API keys, Google webhook credentials, and future Supabase service-role keys server-side only.
- Browser code may use only public/anon keys that are intended for client use and protected by Row-Level Security.
- Never expose the Google Apps Script webhook URL or secret in client bundles.
- Rotate secrets during migration if there is any concern that credentials were logged, copied, or overexposed.

### Row-Level Security

- Enable RLS before exposing any Supabase table to the client.
- Policies should restrict users to their own `tastings`, `label_scans`, `shopping_candidates`, and `label_photos`.
- Shared wine facts can start user-owned for simplicity; only introduce global/shared wine records after a clear deduplication and privacy model exists.
- Server-only admin/import scripts should use narrowly scoped service credentials and be run from trusted environments.

### Image storage privacy

- Label photos may reveal purchasing habits, locations, or personal context in image metadata.
- Store label images in private buckets by default.
- Use signed URLs with short expirations for display.
- Strip or ignore EXIF metadata unless there is a deliberate reason to retain it.
- Define retention and deletion behavior for photos, scans, and user accounts.

## 8. Phased implementation plan

### Phase 0: Planning only

- Keep this document as the source of migration planning.
- Do not implement a database, change app behavior, change routes, change Google Sheet saving, or change environment variables in this phase.

### Phase 1: Add Supabase client/server environment variables

- In a later implementation issue, add the minimum Supabase configuration required for local development and deployment.
- Document client-safe versus server-only variables clearly.
- Do not remove existing OpenAI, Google Sheets, or Basic Auth variables during this phase.

### Phase 2: Create schema

- Add SQL migrations for `users`, `wines`, `tastings`, `label_scans`, `expert_notes`, `shopping_candidates`, and `label_photos`.
- Enable RLS and write policies before client access.
- Add seed or fixture data only if useful for local testing.

### Phase 3: Write parallel save path

- Keep the current Google Sheet save behavior.
- Add a database write after successful validation, while still preserving the Sheet-ready row output.
- Capture enough metadata to compare the database record with the exported Sheet row.
- Fail safely: decide whether Sheet save or database save is authoritative during the temporary parallel-write period.

### Phase 4: Migrate reads

- Read the wine log from the database for authenticated users.
- Provide a one-time import path for existing Google Sheet rows and any unsynced localStorage entries.
- Keep a local cache only as an offline/UX enhancement, not as the source of truth.

### Phase 5: Keep Google Sheet export

- Continue generating the existing Google Sheet row shape from database records.
- Keep manual copy/export and/or server-side Sheet append as reporting and backup features.
- Consider scheduled exports or user-triggered exports once the database is canonical.
