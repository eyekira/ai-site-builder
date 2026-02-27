# AI Site Builder

Next.js (App Router) + TypeScript app for generating restaurant website drafts from Google Places.

## Local setup

```bash
npm install
cp .env.example .env.local
```

Update `.env.local` values, then initialize Prisma:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Run app:

```bash
npm run dev
# http://localhost:5000
```

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Environment variables

See `.env.example` for the full list. Most important:

- `DATABASE_URL` (required)
- `AUTH_SECRET` (required)
- `GOOGLE_MAPS_API_KEY` or `GOOGLE_PLACES_SERVER_KEY` (required for Places APIs)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (required for Google OAuth)
- `OPENAI_API_KEY` (optional, enables AI copy generation)
- `PHOTO_UPLOAD_MODE=local` for local uploads, or configure S3 vars for signed upload mode

## High-level routes

- Public preview: `/preview/[previewId]`
- Editor (owner only): `/editor/[slug]`
- Owner preview: `/editor/[slug]/preview`
- Published rendering: `/s/[slug]` and `/[slug]`

## Notes

- Prisma uses SQLite in dev by default.
- Uploads in local mode are stored in `public/uploads/*`.
