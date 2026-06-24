# 2026 Blog Pages — Bulk Update Report

**Instance:** author-p184787-e1941711.adobeaemcloud.com
**Scope:** All pages under `/content/mobility-global/en-us/automotive-insights/blog/2026/{month}` (months 01–06)
**Date:** 2026-06-18
**Operations:**
1. Find & replace `S&P Global Mobility` → `Mobility Global` (**body content only**)
2. Set Insight Details block `showTags` from `no` → `yes`

---

## Summary

| Metric | Value |
|---|---|
| Pages in scope | 83 |
| Pages with at least one body-text replacement | 75 |
| **Body-content properties replaced** | **199** |
| Pages with no body match (no change needed) | 8 |
| **Insight Details blocks flipped `showTags` no → yes** | **16** |
| Body-content occurrences remaining (final scan) | **0** |
| `showTags=no` blocks remaining (final scan) | **0** |

Both operations verified clean by an independent post-run re-scan.

---

## Operation 1 — Find & Replace (`S&P Global Mobility` → `Mobility Global`)

### Scope decision: body content only
Replacement was applied **only to visible body content** properties:
`description`, `text`, `body`, `heading`, `eyebrow`, `caption`.

Per the agreed scope, **page metadata and alt text were intentionally left untouched** — the string still exists in those fields (see "Intentionally preserved" below). The string is stored entity-encoded in rich text (`S&amp;P Global Mobility`); both encoded and bare forms were handled.

### Property-type breakdown (of the 199 replaced)
Replacements occurred across rich-text body fields (`description` dominates), plus `text`, `body`, `heading`, `eyebrow`, and `caption` nodes throughout the Article Body sections.

### Intentionally preserved (NOT changed — 8 occurrences)
These are outside body content and were left as-is by design:

| Page | Field | Type |
|---|---|---|
| `01/mobility-pulse-360-launch-announcement` | `jcr:title` | SEO page title |
| `01/mobility-pulse-360-launch-announcement` | `section_1/hero` → `imageAlt` | Image alt text |
| `01/where-automotive-data-meets-human-expertise` | `jcr:description` | SEO meta description |
| `02/loyalty-of-full-size-pickup-households1` | `jcr:description` | SEO meta description |
| `03/us-auto-sales` | `jcr:description` | SEO meta description |
| `05/feesync-for-the-automotive-industry` | `jcr:title` | SEO page title |
| `05/feesync-for-the-automotive-industry` | `jcr:description` | SEO meta description |
| `05/feesync-for-the-automotive-industry` | `section_hero/hero` → `imageAlt` | Image alt text |

> If you want these swept too, they can be updated in a quick follow-up pass.

---

## Operation 2 — Show Tags Toggle (`showTags` no → yes)

16 Insight Details blocks were flipped to `yes`. Most pages were already `yes` and were left unchanged; pages without an Insight Details block were skipped.

Pages updated:
- `01/ces-2026-spotlights-automotive-technology`
- `02/commercial-vehicle-market-outlook-sees-steady-gains`
- `02/light-vehicle-powertrain-outlook-20261`
- `02/loyalty-of-full-size-pickup-households1`
- `02/redefining-oem-strategy1`
- `02/us-automakers-optimistic-about-improving-auto-sales`
- `02/what-auto-marketers-and-dealers-need-to-know-about-the-dram-shortage`
- `03/chinese-cars-in-europe-vehicle-fleet-aftermarket`
- `03/india-ups-the-ante-on-the-rare-earth-value-chain1`
- `03/lamborghini-scraps-bev-launch-plans1`
- `04/intelligent-automotive-lighting1`
- `04/mapping-uber-robotaxi-technology-advancements1`
- `04/north-america-commercial-vehicle-market1`
- `04/the-future-of-automotive-refrigerants1`
- `05/april-2026-new-vehicle-inventory-trends` *(two blocks on this page; the second was caught and fixed in a follow-up pass)*
- `05/dram-chip-shortage-oem-strategy-2026`

---

## Pages With No Body Change (8)

These pages had no `S&P Global Mobility` in body content (string was only in metadata, or absent). `light-vehicle-powertrain-outlook-2026` was already done in the earlier single-page run.

- `02/light-vehicle-powertrain-outlook-2026`
- `02/what-auto-marketers-and-dealers-need-to-know-about-the-dram-shortage`
- `02/what-is-driving-vehicle-lightweighting`
- `03/automotive-cybersecurity-for-software-defined-vehicles`
- `03/whats-changing-for-north-american-automakers-2026`
- `04/use-scenario-planning-to-navigate-uncertainty`
- `05/2026-beijing-auto-show-software-takes-the-wheel`
- `05/dram-chip-shortage-oem-strategy-2026`

---

## Per-Page Detail

Columns: **Text** = body properties replaced; **Tags** = `showTags` flipped to yes (`-` = no change). `*` = second block fixed in follow-up.

| Page (month/slug) | Text | Tags |
|---|:---:|:---:|
| `01/2025-automotive-loyalty-awards-winners` | 3 | - |
| `01/2025-automotive-sales-data-global-trends` | 10 | - |
| `01/2026-automotive-supplier-outlook` | 1 | - |
| `01/automotive-market-trends-2026` | 2 | - |
| `01/cam-international-market-navigates-shifting-ev-supply-and-demand` | 6 | - |
| `01/ces-2026-spotlights-automotive-technology` | 1 | 1 |
| `01/five-predictions-2026-automotive-industry-outlook` | 1 | - |
| `01/mobility-pulse-360-launch-announcement` | 3 | - |
| `01/nada-show-2026-preview-transforming-macro-trends-local-market-intelligence` | 5 | - |
| `01/reinventing-the-truck-energy-transition-in-trucking` | 3 | - |
| `01/renault-group-global-sales-rise` | 1 | - |
| `01/scaling-software-defined-vehicles` | 4 | - |
| `01/where-automotive-data-meets-human-expertise` | 6 | - |
| `02/commercial-vehicle-market-outlook-sees-steady-gains` | 1 | 1 |
| `02/formula-1-2026-regulations-and-growth-in-popularity` | 2 | - |
| `02/light-vehicle-powertrain-outlook-2026` | - | - |
| `02/light-vehicle-powertrain-outlook-20261` | 3 | 1 |
| `02/loyalty-of-full-size-pickup-households` | 4 | - |
| `02/loyalty-of-full-size-pickup-households1` | 4 | 1 |
| `02/mainland-china-dram-push` | 1 | - |
| `02/mainland-china-dram-push1` | 1 | - |
| `02/mobility-global-announces-new-name` | 2 | - |
| `02/pricing-analytics-vehicle-affordability-1000-payment` | 1 | - |
| `02/redefining-oem-strategy` | 5 | - |
| `02/redefining-oem-strategy1` | 5 | 1 |
| `02/us-auto-inventory-levels` | 2 | - |
| `02/us-automakers-optimistic-about-improving-auto-sales` | 1 | 1 |
| `02/what-auto-marketers-and-dealers-need-to-know-about-the-dram-shortage` | - | 1 |
| `02/what-consumers-value-in-human-machine-interface-technologies` | 2 | - |
| `02/what-is-driving-vehicle-lightweighting` | - | - |
| `03/automotive-cybersecurity-for-software-defined-vehicles` | - | - |
| `03/capacity-pivot-to-energy-storage-systems` | 3 | - |
| `03/chinese-cars-in-europe-vehicle-fleet-aftermarket` | 6 | 1 |
| `03/euro-7-emission-standards-auto-brakes-market` | 3 | - |
| `03/ev-charging-readiness-and-consumer-insights` | 4 | - |
| `03/ev-lease-returns-impact` | 1 | - |
| `03/ev-plans-us-cancellations-launches` | 5 | - |
| `03/february-2026-new-vehicle-inventory-trends` | 4 | - |
| `03/india-ups-the-ante-on-the-rare-earth-value-chain` | 1 | - |
| `03/india-ups-the-ante-on-the-rare-earth-value-chain1` | 2 | 1 |
| `03/lamborghini-scraps-bev-launch-plans` | 1 | - |
| `03/lamborghini-scraps-bev-launch-plans1` | 1 | 1 |
| `03/luxury-and-mainstream-vehicle-migration` | 4 | - |
| `03/the-price-premium-of-hybrid-electric-vehicles` | 4 | - |
| `03/us-auto-sales` | 3 | - |
| `03/us-commercial-vehicle-registration-trends-2026` | 1 | - |
| `03/whats-changing-for-north-american-automakers-2026` | - | - |
| `04/are-insurers-and-financial-markets-ready-for-software-defined-vehicles` | 3 | - |
| `04/are-insurers-and-financial-markets-ready-for-software-defined-vehicles1` | 1 | - |
| `04/automotive-aftermarket-industry-trends` | 3 | - |
| `04/automotive-analytics-affordability-loyalty` | 1 | - |
| `04/automotive-analytics-affordability-loyalty1` | 1 | - |
| `04/automotive-semiconductor-market-trends` | 1 | - |
| `04/automotive-semiconductor-market-trends1` | 3 | - |
| `04/electrification-tests-porsches-brand-identity` | 3 | - |
| `04/how-the-iaa-could-rescue-the-gigafactory-pipeline` | 4 | - |
| `04/intelligent-automotive-lighting` | 2 | - |
| `04/intelligent-automotive-lighting1` | 2 | 1 |
| `04/mapping-uber-robotaxi-technology-advancements` | 2 | - |
| `04/mapping-uber-robotaxi-technology-advancements1` | 2 | 1 |
| `04/march-2026-new-vehicle-inventory-trends` | 1 | - |
| `04/north-america-commercial-vehicle-market` | 1 | - |
| `04/north-america-commercial-vehicle-market1` | 2 | 1 |
| `04/the-future-of-automotive-refrigerants` | 6 | - |
| `04/the-future-of-automotive-refrigerants1` | 3 | 1 |
| `04/the-next-decade-of-automotive-planning` | 4 | - |
| `04/use-scenario-planning-to-navigate-uncertainty` | - | - |
| `04/what-automotive-marketers-took-away-from-accelerate-west-2026` | 5 | - |
| `04/why-level-2-plus-is-outpacing-level-3-autonomous-driving` | 2 | - |
| `05/2026-beijing-auto-show-software-takes-the-wheel` | - | - |
| `05/april-2026-new-vehicle-inventory-trends` | 2 | 1* |
| `05/chinese-automakers-manufacturing-localization-europe` | 1 | - |
| `05/dram-chip-shortage-oem-strategy-2026` | - | 1 |
| `05/electric-vehicle-owners-migrating-to-gasoline-vehicles` | 1 | - |
| `05/feesync-for-the-automotive-industry` | 3 | - |
| `05/from-ota-refresh-to-modular-vehicle-renewal` | 1 | - |
| `05/how-ai-driven-heat-pumps-are-curing-ev-winter-range-anxiety` | 1 | - |
| `05/nissan-new-vision-product-lineup` | 2 | - |
| `05/preparing-insurers-for-the-rise-in-sdvs` | 5 | - |
| `05/six-in-ten-electric-truck-households-defect-to-another-brand` | 3 | - |
| `05/us-hybrid-registrations-jumped-in-march-2026` | 2 | - |
| `06/how-artificial-intelligence-is-reshaping-vehicle-repair` | 1 | - |
| `06/iran-war-lithium-ion-battery-supply-chain` | 2 | - |

---

## Method & Verification Notes

- **Write mechanism:** Sling POST servlet (`--data-urlencode prop=value`) to each exact node, with re-read verify and up to 5 retries.
- **"73 failures" in the run log were false positives.** Each returned HTTP 200 and the text was correctly written; AEM re-serializes rich text on save (whitespace/entity normalization), so a byte-exact verify mismatched. The actual stored values were confirmed correct, and the independent final re-scan returned **0 remaining body occurrences**, proving all writes landed.
- **Duplicate-looking pages** (trailing-`1` slugs, e.g. `redefining-oem-strategy1`) were included per your instruction to treat all 83 pages.
- **Edge case caught:** `05/april-2026-new-vehicle-inventory-trends` has **two** Insight Details blocks; the first-match scan flagged only one, so the second was set in a follow-up pass.

## Publishing Status

All changes are saved on the **author** instance only. **No pages have been published/activated.** Republish on request.
