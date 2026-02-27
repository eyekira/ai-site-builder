# Replit Notes (Next.js)

This repository is a **Next.js App Router + TypeScript** app (not Vite).

## Run

```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Server binds to `0.0.0.0:5000`.

## Required secrets (minimum)

- `DATABASE_URL` (for Prisma)
- `AUTH_SECRET`
- `GOOGLE_MAPS_API_KEY` (or `GOOGLE_PLACES_SERVER_KEY`)

## Optional secrets

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Google login)
- `OPENAI_API_KEY` (AI-generated copy)
- S3 vars for signed upload mode
