# MVP Roadmap Implementation Status (Current Codebase)

Reference point: current working tree on the `main` branch.

## Phase 0. Project Stabilization
- [~] **Resolve Git issues / remove Vite leftovers**
  - Next.js configuration and structure exist, but a Vite `index.html` still remains at the repository root.
- [x] **Keep only Next.js App Router runtime structure**
  - `app/`-based routing and `next.config.ts` are present.
- [~] **Environment variables / secrets setup guidance**
  - `README` documents `GOOGLE_PLACES_SERVER_KEY`, but not `NEXT_PUBLIC_GOOGLE_PLACES_KEY`.
- [~] **`/api/test-places` successful Places call (status 200)**
  - Real Google Places call logic exists in `src/app/api/test-places/route.ts`,
    but the route currently used by the app (`app/api/test-places/route.ts`) returns mock data.

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
1. **Foundation status**: A Next.js App Router scaffold is in place, and a basic home screen + search UI + test API (mock) are functional.
2. **Database readiness**: Prisma schema defines core MVP entities.
3. **Primary gap**: Key product capabilities (real Places proxy integration, place selection persistence, draft generation/rendering/editing) are still at a pre-implementation stage.
4. **Cleanup needed**: Root `index.html` (Vite leftover) and duplicate implementations in `src/app/api/test-places` vs `app/api/test-places` should be consolidated.
