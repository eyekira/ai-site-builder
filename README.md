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
