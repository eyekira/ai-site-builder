# MVP Roadmap Implementation Status (Current Codebase)

Reference point: current working tree on the `main` branch.

## Phase 0. Project Stabilization
- [x] **Resolve Git issues / remove Vite leftovers**
  - Root Vite leftover `index.html` removed.
- [x] **Keep only Next.js App Router runtime structure**
  - `app/`-based routing and `next.config.ts` are present.
- [x] **Environment variables / secrets setup guidance**
  - `README` documents both `GOOGLE_PLACES_SERVER_KEY` and optional `NEXT_PUBLIC_GOOGLE_PLACES_KEY`, including server-key safety guidance.
- [x] **`/api/test-places` successful Places call (status 200)**
  - Canonical `app/api/test-places/route.ts` now performs real Google Places calls via `GOOGLE_PLACES_SERVER_KEY`; duplicate mock/alternate route removed.

## Phase 1. “Business Selection” Flow
### 1.1 Data Model
- [x] Minimal schema is implemented (models corresponding to `users/sites/places/site_sections`)
  - `User`, `Site`, `Place`, `Section`, and related enums are defined.

### 1.2 UI
- [x] Home search input + result list UI implemented
- [ ] “Creating site...” state and redirect to draft editor page after selection are not implemented

### 1.3 Server APIs
- [ ] `/api/places/autocomplete?q=...` not implemented
- [ ] `/api/places/details?place_id=...` not implemented
- [ ] `/api/sites/create-from-place` not implemented
- [ ] End-to-end flow (search → select → draft creation) not completed

## Phase 2. “Automatic Site Generation”
- [ ] Section generation rules (Hero/About/Contact/Gallery) not implemented
- [ ] Public page routing `/s/[slug]` not implemented
- [ ] Draft access control and publish transition not implemented

## Phase 3. Customize Editor
- [ ] Site title/subtitle editing not implemented
- [ ] Section reordering not implemented
- [ ] About/CTA editing not implemented
- [ ] Theme editing not implemented
- [ ] Menu CRUD/file upload/menu section rendering not implemented

## Key Current-State Summary
1. **Foundation status**: A Next.js App Router scaffold is in place, and a basic home screen + search UI + real server-backed test API route are functional.
2. **Database readiness**: Prisma schema defines core MVP entities.
3. **Primary gap**: Key product capabilities (place selection persistence, draft generation/rendering/editing) are still at a pre-implementation stage.
4. **Cleanup status**: Root Vite leftovers and duplicate `test-places` route implementations have been consolidated.
