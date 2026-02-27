# Template System v2 (Integrated from UX Research + UI Design Agents)

## Agent Sources (Dashboard-style reporting)
- Registered agent: `main`
  - Run label: `ux-research-restaurant-templates`
  - Output: 10 restaurant archetypes, conversion goals, section priorities, mobile CTA priorities, anti-patterns
- Registered agent: `main`
  - Run label: `ui-design-system-restaurant-templates`
  - Output: layout blueprints, hero variants, nav styles, card density, component variants, token naming

---

## Archetype Set (v2)
1. fine_dining_premium
2. omakase_counter
3. steakhouse_classic
4. family_korean
5. bbq_group
6. cafe_cozy
7. bakery_patisserie
8. brunch_social
9. fast_casual
10. takeout_delivery_first

---

## Default CTA Priority by Archetype
- Fine dining / omakase / steakhouse: Reserve-first
- Family / BBQ / fast casual: Order + group booking
- Cafe / bakery / brunch: Visit + preorder + waitlist
- Takeout-first: Order-direct + ETA/zone

---

## Layout Variant Contract
- heroVariant: `centered | split | compact | fullBleed | minimal`
- menuVariant: `standard | dense | editorial | bento`
- reviewVariant: `cards | quotes | stars-inline | ticker`
- reservationVariant: `inline-form | sticky-bar | modal-trigger | calendar-panel`
- mapVariant: `split-map | card-map | full-width | minimal-pin`

---

## Build Plan (next code steps)
1. Expand template key taxonomy from 6 -> 10 in selector/types
2. Add archetype-specific section order and CTA modules
3. Add presentation variants (hero/menu/review) per archetype
4. Add sticky mobile CTA set generation by archetype
5. Add editor manual override (template select) and persist metadata
6. Regression checks: anon preview, owner edit/save, non-owner denied
