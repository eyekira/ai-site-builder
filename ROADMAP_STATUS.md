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
- [ ] Edit content
- [ ] Reorder sections
- [ ] Save changes

User cannot:
- [ ] Publish the site
- [ ] Access a dashboard
- [ ] Enable a public URL

CTA shown clearly:
- [ ] “Publish requires login and subscription”

---

### Logged-In User (No Subscription)
- [ ] Logs in
- [ ] Draft site is claimed (owner assigned)
- [ ] User gains access to:
  - [ ] Dashboard
  - [ ] Saved draft sites
- [ ] User can still edit drafts
- [ ] Publish remains locked

CTA:
- [ ] “Subscribe to publish your site”

---

### Subscribed User
- [ ] Publish button becomes active
- [ ] Site transitions:
  - [ ] DRAFT → PUBLISHED
- [ ] Public site becomes available:
  - URL: `/s/[slug]`

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
- [ ] `/api/sites/create-from-place`
  - [ ] Public endpoint (no auth)
  - [ ] Creates a DRAFT site
  - [ ] `ownerId = null`
- [ ] Redirect behavior:
  - [ ] Always redirect to `/editor/[slug]`
- [ ] Existing site selection:
  - [ ] Always open editor (never `/s/[slug]`)

---

### Phase 2 — Draft Editor (Free Experience)

Goal:  
“Let users fully experience the builder before paying”

Tasks:
- [ ] Allow editor access for unclaimed drafts
- [ ] Enable:
  - [ ] Content editing
  - [ ] Section reordering
  - [ ] Saving
- [ ] Disable:
  - [ ] Publish action (UI + API)
- [ ] Show clear upgrade CTA in editor

---

### Phase 3 — Authentication & Ownership

Goal:  
“Draft becomes my site”

Tasks:
- [ ] Auth system (basic login)
- [ ] Draft claim:
  - [ ] Assign `site.ownerId` on login
- [ ] Dashboard:
  - [ ] List of user’s sites
  - [ ] Draft / Published badge

---

### Phase 4 — Subscription & Publishing

Goal:  
“Payment unlocks publishing”

Tasks:
- [ ] Subscription model (simple boolean or plan enum)
- [ ] Publish API:
  - [ ] Anonymous → 401
  - [ ] Logged-in but not subscribed → 402 or clear custom error
  - [ ] Subscribed → success
- [ ] `/s/[slug]`:
  - [ ] Render only PUBLISHED sites
  - [ ] Drafts return `notFound` or gated page

---

### Phase 5 — Post-MVP (Later)
- [ ] Themes
- [ ] Menu / Gallery / Reviews
- [ ] Custom domains
- [ ] SEO controls
- [ ] Analytics

---

Summary: Updated the roadmap to match the Builder SaaS model with clear access rules, phased tasks, and checkbox tracking.
