# AI Site Builder

This project uses **Next.js (App Router) + TypeScript**.

## Run locally

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env` file and set the Google Places server key:

```bash
GOOGLE_PLACES_SERVER_KEY=your_server_key_here
```

> The key is read only on the server (Route Handler), so it is not exposed to browser clients.

## Structure

- `app/*`: App Router pages/layouts (server components by default)
- `app/components/*`: client components can use `"use client"`
- `app/api/*`: server API route handlers
- `src/app/api/test-places/route.ts`: test endpoint for Google Places (New) Text Search
