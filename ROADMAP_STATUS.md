# MVP Roadmap Implementation Status (Current Codebase)

Reference point: current working tree on the `work` branch.

## Phase 0. Project Stabilization
- [x] **Resolve Git issues / remove Vite leftovers**
  - Root Vite leftover `index.html` is not present in the current tree.
- [x] **Keep only Next.js App Router runtime structure**
  - `app/`-based routing and `next.config.ts` are present.
- [x] **Environment variables / secrets setup guidance**
  - `README.md` documents `GOOGLE_PLACES_SERVER_KEY` and optional `NEXT_PUBLIC_GOOGLE_PLACES_KEY`, with server-key guidance.
- [x] **`/api/test-places` successful Places call (status 200)**
  - `app/api/test-places/route.ts` performs a real Google Places call via `GOOGLE_PLACES_SERVER_KEY`.

## Phase 1. “Business Selection” Flow
### 1.1 Data Model
- [x] Minimal schema is implemented (models corresponding to `users/sites/places/site_sections`)
  - `User`, `Site`, `Place`, `Section`, and enums (`SiteStatus`, `SectionType`) are defined in Prisma.

### 1.2 UI
- [x] Home search input + result list UI implemented
  - `PlaceSearch` supports query input, loading/empty/error states, and renders selectable results.
- [~] “Creating site...” state and redirect to draft editor page after selection
  - “Creating site...” feedback is implemented.
  - Redirect behavior is still partially aligned: new sites route to `/s/[slug]` and existing sites route to `/editor/[slug]`.

### 1.3 Server APIs
- [x] `/api/places/autocomplete?q=...` implemented
- [x] `/api/places/details?place_id=...` implemented
- [x] `/api/sites/create-from-place` implemented
  - Fetches place details, upserts place record, creates/returns a draft site, and seeds default sections.
- [x] End-to-end flow (search → select → draft creation) implemented
  - Search, place selection, and draft site creation are wired through to persisted site records.
  - Both public site view (`/s/[slug]`) and draft editor route (`/editor/[slug]`) are available.

## Phase 2. “Automatic Site Generation”
- [x] Section generation rules (Hero/About/Contact baseline) implemented
  - Initial section seed logic exists for HERO, ABOUT, and CONTACT.
- [ ] Gallery/menu/reviews section generation rules not implemented
- [x] Public page routing `/s/[slug]` implemented
  - Dynamic page loads and renders stored sections.
- [ ] Draft access control and publish transition not implemented

## Phase 3. Customize Editor
- [ ] Site title/subtitle editing not implemented
- [x] Section reordering implemented
- [x] About/CTA editing implemented
- [ ] Theme editing not implemented
- [ ] Menu CRUD/file upload/menu section rendering not implemented
- [x] Draft editor route (`/editor/[slug]`) implemented

## Key Current-State Summary
1. **Foundation status**: Next.js App Router structure is in place with a functional home search UI and server-backed Places integration routes.
2. **Database readiness**: Prisma schema provides core MVP entities and enums.
3. **Implemented core flow**: Autocomplete, place details lookup, and site creation from a selected place are now connected.
4. **Primary remaining gap**: publishing workflow/status transitions and richer section/theme features remain incomplete.
