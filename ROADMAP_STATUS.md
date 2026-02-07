# 🧭 MVP Roadmap (Updated – Builder SaaS Model)

## Product Principle
Anyone can generate and edit a draft site.  
Publishing requires login + subscription.

This keeps friction low for first-time users while creating a clear monetization gate.

## User Flow Overview

### Anonymous User (No Account)
- [ ] Search for a business
- [ ] Select a business
- [ ] Website is auto-generated
- [ ] User is redirected always to the editor
  - URL: `/editor/[slug]`

User can:
- [x] Edit content
- [x] Reorder sections
- [x] Save changes
- [x] Reopen draft on same device

User cannot:
- [ ] Publish the site
- [ ] Access a dashboard
- [ ] Enable a public URL

CTA shown clearly:
- [x] “Publish requires login and subscription”

---

### Logged-In User (No Subscription)
- [x] Logs in
- [x] Draft site is claimed (owner assigned)
- [x] User gains access to:
  - [x] Dashboard
  - [x] Saved draft sites
- [x] User can still edit drafts
- [ ] Publish remains locked

CTA:
- [x] “Subscribe to publish your site”

---

### Subscribed User
- [x] Publish button becomes active
- [x] Site transitions:
  - [x] DRAFT → PUBLISHED
- [x] Public site becomes available:
  - [x] URL: `/s/[slug]`

User can:
- [ ] Re-publish after edits
- [ ] Manage sites from dashboard

## Access Rules (RBAC Summary)

| Action | Anonymous | Logged-in | Subscribed |
| --- | --- | --- | --- |
| Search business | ✅ | ✅ | ✅ |
| Create site | ✅ | ✅ | ✅ |
| Edit draft | ✅ | ✅ | ✅ |
| Save draft | ✅ | ✅ | ✅ |
| Publish | ❌ | ❌ | ✅ |
| Public site | ❌ | ❌ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |

## Phase Breakdown

### Phase 0 — Project Stabilization (DONE)
- [x] Next.js App Router only
- [x] No Vite runtime
- [x] Prisma schema initialized
- [x] Google Places API working (`/api/test-places`)

---

### Phase 1 — Business Selection & Draft Creation

Goal:  
“Select a business → land in the editor every time”

Tasks:
- [x] `/api/sites/create-from-place`
  - [x] Public endpoint (no auth)
  - [x] Creates a DRAFT site
  - [x] `ownerId = null`
- [x] Redirect behavior:
  - [x] Always redirect to `/editor/[slug]`
- [x] Existing site selection:
  - [x] Always open editor (never `/s/[slug]`)

---

### Phase 2 — Draft Editor (Free Experience)

Goal:  
“Let users fully experience the builder before paying”

Tasks:
- [x] Allow editor access for unclaimed drafts
- [x] Enable:
  - [x] Content editing
  - [x] Section reordering
  - [x] Saving
- [x] Disable:
  - [x] Publish action (UI + API)
- [x] Show clear upgrade CTA in editor
- [x] Anonymous draft ownership via anon session cookie

---

### Phase 3 — Authentication & Ownership

Goal:  
“Draft becomes my site”

Tasks:
- [x] Auth system (basic login)
- [x] Draft claim:
  - [x] Assign `site.ownerId` on login
- [x] Logout flow (clear session and return to anonymous mode)
- [x] Dashboard:
  - [x] List of user’s sites
  - [x] Draft / Published badge

---

### Phase 4 — Subscription & Publishing

Goal:  
“Payment unlocks publishing”

Tasks:
- [x] Subscription model (simple boolean or plan enum)
- [x] Publish API:
  - [x] Anonymous → 401
  - [x] Logged-in but not subscribed → 402 or clear custom error
  - [x] Subscribed → success
- [x] `/s/[slug]`:
  - [x] Render only PUBLISHED sites
  - [x] Drafts return `notFound` or gated page

---

### Phase 5 — Post-MVP (Later)
- [x] Themes
- [x] Menu / Gallery / Reviews
- [ ] Custom domains
- [ ] SEO controls
- [ ] Analytics

---

Summary: Updated the roadmap to match the Builder SaaS model with clear access rules, phased tasks, and checkbox tracking.
