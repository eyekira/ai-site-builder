# Restaurant Template System v1 (UX Research + Design Spec)

## Goal
Generate higher-converting restaurant sites by auto-selecting a template based on Google Places signals and photo characteristics.

---

## UX Principles (applies to all templates)

1. **Primary action above the fold**
   - Priority order: Reserve > Order > Call > Visit
2. **Decision info in first scroll**
   - Cuisine/type, price signal, rating/proof, hours, location
3. **Menu discoverability**
   - Menu/featured dishes visible by section 2-3
4. **Trust proof early**
   - Reviews, social proof, photo quality
5. **Mobile-first task completion**
   - Tap-to-call, map, hours, booking CTA

---

## Template Families

### 1) `fine_dining_premium`
**Use when:** high price signal, upscale interior photos, reservation intent
- Hero: cinematic image + reservation CTA
- Sections: Hero → Signature Experience → Chef/Story → Menu Highlights → Reservation → Location
- Tone: refined, curated
- CTA: "Reserve a Table"

### 2) `cozy_cafe`
**Use when:** cafe/bakery/brunch vibe, warm interior, daytime traffic
- Hero: atmosphere + best-sellers
- Sections: Hero → Best Sellers → About Space → Hours/Visit → Instagram-style gallery
- Tone: warm, friendly
- CTA: "See Today’s Menu" / "Visit Us"

### 3) `fast_casual`
**Use when:** quick service / takeaway / delivery patterns
- Hero: speed/value proposition
- Sections: Hero → Popular Items → How to Order → Delivery/Pickup → Location
- Tone: direct, practical
- CTA: "Order Now"

### 4) `family_korean_asian`
**Use when:** family dining cues, group menu, sharing dishes
- Hero: family/group angle
- Sections: Hero → Signature Dishes → Group Menu → Reviews → Contact/Hours
- Tone: welcoming, abundant
- CTA: "View Menu" / "Call to Reserve"

### 5) `brunch_bakery`
**Use when:** pastry/coffee/brunch, visual food emphasis
- Hero: product-led visuals
- Sections: Hero → Featured Items → Seasonal Picks → Visit Info → Gallery
- Tone: fresh, trendy
- CTA: "Today’s Specials"

### 6) `default_bistro`
Fallback template when confidence is low.

---

## Auto-Selection Inputs

From Places + existing pipeline:
- Place display name / categories / address context
- Rating + review volume (if available)
- Price level (if available)
- Opening hours pattern
- Photo classifier distribution:
  - `food`, `interior`, `exterior`, `menu`, `people`

---

## Mapping Rules (v1)

### Rule precedence
1. Explicit category keyword match
2. Price + photo distribution
3. Hours pattern clues
4. fallback default

### Keyword triggers
- `fine_dining_premium`: `fine dining`, `steakhouse`, `omakase`, `tasting`
- `cozy_cafe`: `cafe`, `coffee`, `espresso`
- `brunch_bakery`: `bakery`, `brunch`, `pastry`, `dessert`
- `fast_casual`: `fast food`, `takeout`, `delivery`, `quick`
- `family_korean_asian`: `korean`, `bbq`, `hotpot`, `asian`

### Photo heuristics
- high `interior` + high price signal => `fine_dining_premium`
- high `food` + quick-service keywords => `fast_casual`
- high `food` + bakery/cafe keywords => `brunch_bakery` or `cozy_cafe`

### Confidence
- score 0~1 from weighted signals
- if `<0.45`, use `default_bistro`

---

## Data Contract (proposed)

`Site.themeJson` will include:
```json
{
  "name": "classic",
  "templateKey": "cozy_cafe",
  "templateConfidence": 0.72,
  "templateSignals": {
    "keywordMatch": ["cafe"],
    "photoMix": {"food": 0.4, "interior": 0.35, "exterior": 0.15, "menu": 0.1},
    "priceHint": 2
  }
}
```

---

## Implementation Plan (small PR chunks)

### PR-1: Template domain model
- add `lib/templates/types.ts`
- add `lib/templates/catalog.ts` (template definitions)
- add `lib/templates/select.ts` (selection function)
- add unit-like deterministic tests (or script checks)

### PR-2: Creation pipeline integration
- integrate in `app/api/sites/from-place/route.ts`
- pick template before section creation
- inject section defaults by `templateKey`
- include confidence/signals in `themeJson`

### PR-3: Editor visibility + manual override
- show selected template badge in editor
- allow owner override dropdown
- preserve auto metadata for analytics

---

## Safety / RBAC impact
No RBAC relaxation required.
- Selection logic is read-only and pre-write.
- Existing owner checks remain unchanged for editor and mutation routes.

Regression checks required:
1. anonymous preview works, cannot persist owner edits
2. owner can edit and save own site
3. non-owner cannot read/mutate owner resources
