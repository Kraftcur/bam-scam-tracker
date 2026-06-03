# BAM Scam Tracker

An evidence-first, plain-English tracker for the Bricks & Minifigs / RecklessBen controversy. The homepage is built as a near one-page story map: video watch order, hot questions, timeline cards, court/law-filing explainers, source provenance, and a donation CTA.

The editorial voice is accountability-forward and sympathetic to the public evidence RecklessBen has surfaced, while still separating verified records, official statements, allegations, commentary, and unanswered questions.

## Stack

- Astro with React islands
- Cloudflare Pages for the web app
- Cloudflare D1 for structured tracker data
- Cloudflare R2 for archived public documents and clips
- Cloudflare Turnstile for submission spam control
- Separate Cloudflare Worker cron for scheduled ingestion

## Local Development

```bash
npm install
npm run dev
```

The app falls back to `src/data/seed.ts` when no D1 binding is available.

## Main Experiences

- `/` - story-led evidence explorer with the five-act timeline, hot questions, video trail, court decoder, latest tracker updates, submission CTA, and donation CTA.
- `/timeline` - filterable archive of dated events.
- `/documents` - searchable source and document library.
- `/cases` - court case and docket tracker.
- `/claims` - claim/evidence matrix with status labels.
- `/clips` - audio/video clip index with timestamps and source links.
- `/submit` - public evidence submission form.
- `/about` - editorial policy, correction policy, donation disclosure, and legal disclaimer.
- `/admin` - token-protected moderation queue for v1.

## Cloudflare Setup

1. Create a D1 database named `bam_scam_tracker`.
2. Replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.toml` and `wrangler.ingest.toml`.
3. Create an R2 bucket named `bam-scam-tracker-archive`.
4. Create a KV namespace for Astro sessions and replace `REPLACE_WITH_KV_NAMESPACE_ID` in the Wrangler configs.
5. Set secrets:

```bash
wrangler pages secret put ADMIN_TOKEN
wrangler pages secret put OPENAI_API_KEY
wrangler pages secret put TURNSTILE_SECRET_KEY
wrangler secret put OPENAI_API_KEY -c wrangler.ingest.toml
```

6. Apply and seed D1:

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

7. Build and deploy:

```bash
npm run build
npm run cf:deploy
npm run cf:deploy:ingest
```

## Editorial Rules

- Every event must have at least one source.
- Each public item should show provenance, status, confidence, and last-checked context where available.
- Complaint allegations remain allegations unless a court finding changes them.
- Official statements are the speaker's position, not independent proof.
- Video claims and community/social claims require source links and human review before being treated as tracker facts.
- Private identifying information is excluded.
- Community submissions and social claims require human review.

## Useful Scripts

```bash
npm run db:migrate:local
npm run db:seed:local
npm run r2:upload -- /absolute/path/to/public-redacted.pdf documents/file.pdf
npm run pdf:extract -- /absolute/path/to/public-redacted.pdf
```
