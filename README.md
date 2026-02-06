# AI Site Builder

This project uses **Next.js (App Router) + TypeScript**.

## Run locally

```bash
npm install
npm run dev
```

## npm mirror setup (Replit / CI)

If your environment cannot access `registry.npmjs.org` directly, configure the project to use your company npm mirror.

1. **Set secrets/variables**
   - `MIRROR_URL`: full mirror registry URL (example: `https://npm.company.internal/repository/npm/`)
   - `NPM_TOKEN`: token that can read from the mirror

2. **Replit setup**
   - Open **Tools → Secrets**
   - Add secret `MIRROR_URL` with your mirror registry URL
   - Add secret `NPM_TOKEN` with your auth token

3. **CI setup (GitHub Actions example)**
   - Add repository or organization secrets named `MIRROR_URL` and `NPM_TOKEN`
   - Ensure the job exports them to environment variables before `npm ci`, for example:

```yaml
- name: Install dependencies
  env:
    MIRROR_URL: ${{ secrets.MIRROR_URL }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: npm ci --no-audit --no-fund
```

4. **Update `.npmrc` host placeholder once**
   - In `.npmrc`, replace `YOUR_MIRROR_HOST` in this line:
     - `//YOUR_MIRROR_HOST/:_authToken=${NPM_TOKEN}`
   - Use only the host part from `MIRROR_URL` (no `https://`, no path).

5. **Verify**

```bash
npm config get registry
npm ci --no-audit --no-fund
```

## Environment variables

Create a `.env` file and set your Google Places keys:

```bash
GOOGLE_PLACES_SERVER_KEY=your_server_key_here
NEXT_PUBLIC_GOOGLE_PLACES_KEY=your_client_key_here # optional
```

- `GOOGLE_PLACES_SERVER_KEY`: **required** for server-side API calls from `app/api/test-places/route.ts`.
- `NEXT_PUBLIC_GOOGLE_PLACES_KEY`: optional browser key for future direct client integrations.

> Never expose `GOOGLE_PLACES_SERVER_KEY` to client-side code. Only `NEXT_PUBLIC_*` variables are meant for browser use.

## Structure

- `app/*`: App Router pages/layouts (server components by default)
- `app/components/*`: client components can use `"use client"`
- `app/api/*`: server API route handlers
- `app/api/test-places/route.ts`: test endpoint for Google Places (New) Text Search

## MVP access control (temporary)

Editor routes and publish APIs require the `x-mvp-user-id` header. Use the numeric owner id that matches the site (the seeded demo user is usually `1`).

## Manual test checklist

1. Create site from place → redirects to `/editor/[slug]`.
2. Draft public URL blocked: open `/s/[slug]` and confirm the “not published” message.
3. Publish flow:
   - `curl -X POST http://localhost:3000/api/sites/[slug]/publish -H "x-mvp-user-id: 1"`
   - Visit `/s/[slug]` and confirm the site renders.
4. Owner-only enforcement:
   - `curl -X POST http://localhost:3000/api/sites/[slug]/publish -H "x-mvp-user-id: 999"`
   - Confirm 403 response.
