# Mobility Global - Content Migration Reference

## Project Overview

Migration of S&P Global Mobility website content to AEM Edge Delivery Services (EDS) using JCR content packages. The project covers blog pages, expert pages, rapid impact analysis (RIA) pages, and taxonomy tagging across all migrated content.

**AEM Environment:**
- Author: `https://author-p184787-e1941710.adobeaemcloud.com`
- Template (blogs/insights): `/conf/mobilityglobal/settings/wcm/templates/insight-details`
- Template (experts): `/conf/mobility-global/settings/wcm/templates/expert-details-page`
- Content root: `/content/mobility-global/en-us/`

---

## Migration Summary

| Page Type | Count | Status |
|---|---|---|
| Blog pages (existing) | 344 | Content + taxonomy migrated |
| Expert pages | 65 | Content + taxonomy migrated |
| New blog pages (marketscan) | 16 | Full content + taxonomy |
| New blog/RIA pages (spglobal) | 70 | Structure + taxonomy only (403 blocked) |
| Taxonomy-only updates | 479 | Tags applied to existing pages |

---

## Content Structure (Blog Pages)

### JCR Path Pattern
```
/content/mobility-global/en-us/automotive-insights/blogs/{year}/{month}/{slug}
```

### Page Template Structure
```
cq:Page
└── jcr:content (cq:PageContent)
    ├── [page properties + taxonomy tags]
    ├── image (nt:unstructured)
    └── root (core/franklin/components/root/v1/root)
        ├── section_1 (Section - Hero)
        │   └── hero (hero block)
        ├── section_2 (Section - Insight Details) [optional - only if author exists]
        │   └── block (insight-details block)
        ├── section_3 (Section - Article Summary)
        │   ├── tag (tag block)
        │   └── content_module (content-module block)
        └── section_4 (Section - Article Body)
            ├── content_1 (content-module block)
            ├── image_2 (image component) [optional]
            ├── content_3 (content-module block)
            └── ... more content blocks
```

### Key Properties on jcr:content
```
jcr:primaryType = "cq:PageContent"
sling:resourceType = "core/franklin/components/page/v1/page"
cq:template = "/conf/mobilityglobal/settings/wcm/templates/insight-details"
pageType = "Insights Details Page"
jcr:title = "{page title}"
jcr:description = "{meta description}"
jcr:created = "{ISO date}"
jcr:createdBy = "migration-agent"
jcr:lastModified = "{ISO date}"
jcr:lastModifiedBy = "migration-agent"
jcr:mixinTypes = "[mix:versionable,cq:ReplicationStatus2]"
modelFields = "[pageType@select,image@reference,...]"
```

### Content Blocks
- **Hero block**: `model="hero"`, `classes="hero-black-colored-right"`, `image="{Scene7 URL or DAM path}"`
- **Insight Details block**: `model="insight-details"`, `authorVariation="manual"`, `authorImage="{DAM path}"`
- **Content Module block**: `model="content-module"`, `classes="full-width-text"`, `description="{HTML content}"`
- **Tag block**: `model="tag"`, `tagVariation="dark"`, `tag-title="Article Summary"`
- **Embed block**: `model="embed"`, `classes="embed-video"`, `embed_uri="{YouTube URL}"`
- **Image component**: `sling:resourceType="core/franklin/components/image/v1/image"`, `image="{URL}"`

---

## Content Structure (Expert Pages)

### JCR Path Pattern
```
/content/mobility-global/en-us/automotive-insights/experts/{slug}
```

### Page Template Structure
```
cq:Page
└── jcr:content (cq:PageContent)
    ├── [page properties + taxonomy tags]
    └── root
        ├── section_277525532 (Section Media)
        │   └── media_module (classes="expert, left")
        ├── section (Section Insights - bg-quiet-light)
        │   └── insights_card (classes="featured-cards")
        └── section_22392647 (Section Speakers)
            ├── section_title
            └── speaker_cards
```

### Key Properties
```
cq:template = "/conf/mobility-global/settings/wcm/templates/expert-details-page"
pageType = "Experts Page"
overview-enabled = "true"
```

### Media Module Fields
- `expertEyebrow` - Role/title text
- `rte` - Biography HTML
- `profileImage` - DAM path to profile photo
- `classes` - "expert, left"
- `tagVariation` - "dark"

---

## DAM / Image Conventions

### Blog Images
- **Location**: `/content/dam/mobility-global/en-us/blogs/`
- **Hero images**: Scene7 URLs used directly (proven to work without DAM reprocessing)
- **Content images**: Scene7 URLs
- **Format**: `https://spglobal.scene7.com/is/image/spglobalcom/{name}?$responsive$`

### Expert Images
- **Location**: `/content/dam/mobility-global/en-us/experts/{slug}.jpg`
- **Sources**: Scene7, cdn.ihsmarkit.com
- **Important**: After package install, run **Reprocess Assets** on DAM folder

### Image Reference Rules
- `@reference` fields (like `profileImage`, hero `image`) can accept:
  - DAM paths: `/content/dam/...` (needs Reprocess Assets after install)
  - Scene7 URLs: `https://spglobal.scene7.com/...` (works without reprocessing)
- **DO NOT** use CDN URLs for `@reference` fields - they render as `./default-meta-image.png`

---

## Taxonomy System

### Tag Path Structure
Tags are stored at `/content/cq:tags/mobility-global/` in AEM.

### JCR Property → CSV Column → Tag Path Mapping

| JCR Property | CSV Column | Tag Path Prefix |
|---|---|---|
| `pillars` | Taxonomy: Pillar | `mobility-global:pillars/` |
| `needStates` | Taxonomy: Need states | `mobility-global:need-states/` |
| `productFamily` | Taxonomy: Product families | `mobility-global:products-and-platforms/product-families/` |
| `productCapability` | Taxonomy: Product capabilities | `mobility-global:products-and-platforms/product-capabilities/` |
| `platforms` | Taxonomy: Platforms | `mobility-global:products-and-platforms/platforms/` |
| `servicesAdvisory` | Taxonomy: Services and advisory | `mobility-global:products-and-platforms/services-and-advisory/` |
| `insightsThoughtLeaderContentType` | Taxonomy: Insight and thought leader content type | `mobility-global:insights-and-intelligence/insight-and-thought-leader-content-type/` |
| `topic` | Taxonomy: Topic | `mobility-global:insights-and-intelligence/topic/` |
| `theme` | Taxonomy: Theme | `mobility-global:insights-and-intelligence/theme/` |
| `regulatoryContext` | Taxonomy: Regulatory and operating context | `mobility-global:contextual-variables/regulatory-and-operating-context/` |
| `vehicleTypeSegment` | Taxonomy: Vehicle type/segment | `mobility-global:contextual-variables/segmentation-and-user-context/vehicle-type-or-segment/` |
| `industrySector` | Taxonomy: Industry/Sector | `mobility-global:contextual-variables/segmentation-and-user-context/industry-or-sector/` |
| `audienceRole` | Taxonomy: Audience role | `mobility-global:contextual-variables/segmentation-and-user-context/audience-role/` |
| `workflowStage` | Taxonomy: Workflow stage | `mobility-global:system-and-structural-tags/workflow-stage-how-i-do-it/` |
| `contentFormat` | Taxonomy: Content formats | `mobility-global:system-and-structural-tags/content-formats/` |
| `assetAttributes` | Taxonomy: Asset attributes | `mobility-global:system-and-structural-tags/asset-attributes-structural-attributes-or-delivery-mechanisms/` |
| `campaignType` | Taxonomy: Campaign type | `mobility-global:system-and-structural-tags/campaign-type/` |
| `brandDataSource` | Taxonomy: Brand/ data source | `mobility-global:contextual-variables/brand-data-source/` |
| `marketSalesRegion` | Taxonomy: Market - sales region | `mobility-global:contextual-variables/market-context/market-sales-region/` |
| `marketRegion` | Taxonomy: Market - region | `mobility-global:contextual-variables/market-context/market-region/` |
| `marketCountry` | Taxonomy: Market - Country | `mobility-global:contextual-variables/market-context/market-country/` |

### Tag Resolution Process
1. Slugify the CSV value (lowercase, spaces→hyphens, remove special chars)
2. Look up leaf slug in the exported AEM tag tree (`tags_data.zip`)
3. If not found, check manual overrides (for `/` in names, typos)
4. If still not found, skip (don't create incorrect paths)

### Manual Tag Overrides (special cases)
These CSV values have `/` or use different slugs than AEM:

| CSV Value | AEM Tag Path |
|---|---|
| `Government / policy maker` | `.../audience-role/regulatory-risk-and-policy-roles/government-or-policy-maker` |
| `Dealer / retailer` | `.../audience-role/retail-dealer-aftermarket-roles/dealer-or-retailer` |
| `Leasing / financial services` | `.../audience-role/fleet-and-commercial-roles/leasing-or-financial-services` |
| `Insurance analyst / underwriter` | `.../audience-role/regulatory-risk-and-policy-roles/insurance-analyst-or-underwriter` |
| `Report / whitepaper (PDF)` | `.../content-formats/written-formats/report-or-whitepaper-pdf` |
| `Customer education / enablement` | `.../campaign-type/customer-education-or-enablement` |
| `Plan the vehicle` | `mobility-global:need-states/planning-solutions/plan-your-future-vehicle` |
| `Find the right customers` | `mobility-global:need-states/sales-solutions/find-the-right-customer` |
| `Assess and react to the market` | `mobility-global:need-states/sales-solutions/asses-and-react-to-the-market` |
| `Electric vehicle industry` (theme) | `mobility-global:insights-and-intelligence/theme/electric-vehicles` |
| `Aftermarket parts and components` | `.../topic/supply-chain-and-manufacturing/automotive-parts-and-components` |
| `Fleet / rental` | `.../vehicle-type-or-segment/fleet-or-rental` |

### Taxonomy Package Approach
- **Filter mode**: `mode="update"` at `jcr:content` level
- **XML**: Only `jcr:primaryType="cq:PageContent"` + tag properties + `breadcrumb-override=""`
- **Effect**: Adds/updates tag properties without touching content nodes (root, sections, blocks)
- **File structure**: `jcr_root/{page-path}/_jcr_content/.content.xml`

---

## JCR Package Technical Details

### Package Filter Modes
| Mode | Behavior | Use Case |
|---|---|---|
| `merge` | Only creates nodes that don't exist; won't update existing | New page creation (won't overwrite) |
| `update` | Adds/updates properties on existing nodes; preserves child nodes | Taxonomy updates on existing pages |
| `replace` | Completely replaces the node and all children | Fix pages created as wrong node type |

### Critical Learnings

1. **`mode="merge"` does NOT add properties to existing nodes** - only creates new nodes
2. **`mode="update"` at `jcr:content` level is safe** - adds tag properties without deleting content child nodes
3. **Taxonomy tags must be arrays** - even single values: `pillars="[mobility-global:pillars/planning-solutions]"`
4. **All block nodes need timestamps** - `jcr:created`, `jcr:createdBy`, `jcr:lastModified`, `jcr:lastModifiedBy`
5. **Template path matters** - blogs use `/conf/mobilityglobal/...` (no hyphen), experts use `/conf/mobility-global/...`
6. **Images need Reprocess Assets** - Package-installed DAM assets need manual reprocessing for Dynamic Media delivery
7. **Scene7 URLs work for hero images** - Bypasses DAM reprocessing requirement
8. **Author images must use `/automotive-insights/experts/` path** - Not `/blogs/` path

### Package Structure
```
package.zip
├── META-INF/
│   └── vault/
│       ├── properties.xml (name, version, group)
│       ├── filter.xml (filter roots with mode)
│       └── definition/.content.xml (package definition with filter children)
└── jcr_root/
    └── content/
        ├── mobility-global/en-us/automotive-insights/blogs/{year}/{month}/{slug}/.content.xml
        └── dam/mobility-global/en-us/blogs/{image}/_jcr_content/renditions/original
```

---

## Data Sources

### Extracted Blog Content
- **File**: `blog-pages-all.json` (in git commit `334585b`)
- **Count**: 344 pages
- **Fields**: url, slug, title, h1, description, ogImage, heroImage, eyebrow, heroDate, authorName, authorImage, authorLink, articleItems[]
- **ArticleItem types**: `{type: "text", html: "..."}` and `{type: "image", src: "...", alt: "..."}`

### DAM Image Mapping
- **File**: `dam-to-source.json` (in git commit `334585b`)
- **Count**: 824 mappings
- **Format**: `{"/content/dam/path.jpg": "https://spglobal.scene7.com/..."}`

### Taxonomy CSV
- **File**: `taxonomy csv.csv` (in fork repo)
- **Count**: 496 rows
- **Columns**: Full URL, Page Type, 21 taxonomy columns

### AEM Tag Tree
- **File**: `tags_data.zip` (in fork repo)
- **Count**: 476 tags
- **Structure**: JCR content package of `/content/cq:tags/mobility-global/`

### Existing Pages Export
- **File**: `all_migrated_pages.zip` (in fork repo)
- **Count**: 653 pages (345 blogs + 103 experts + 205 other)

---

## Known Issues

| Issue | Impact | Workaround |
|---|---|---|
| S&P Global 403 Forbidden | Can't fetch 70 page contents | Need VPN/auth access or manual entry |
| Hero image not rendering | Shows `default-meta-image.png` | Use Scene7 URLs; OR save page in Universal Editor to trigger reprocessing |
| Footer not showing on blogs | No footer on blog pages | Template/framework config issue - footer loads from `/footer` fragment |
| `breadcrumb-override` property | Creates unwanted breadcrumb | Set to empty string `""` via taxonomy package |
| Pages created as folders | Package with `mode=merge` creates folders not pages | Use `mode=replace` to overwrite with correct `cq:Page` |

---

## File Locations

### Working Data (on server)
```
/workspace/blog-migration/blog-pages-all.json     - Extracted blog content
/workspace/blog-migration/dam-to-source.json      - Image URL mapping
/workspace/taxonomy-migration/taxonomy-full.csv   - Full taxonomy CSV
/workspace/taxonomy-migration/full-tag-tree.json  - AEM tag lookup
/workspace/taxonomy-migration/all_migrated_pages.zip - AEM page export
/workspace/new-pages-migration/*.html             - Fetched HTML pages
```

### Git Repository (fork: omikabira/spglobal-mobility-packages)
```
fork/main:
  - taxonomy csv.csv
  - all_migrated_pages.zip
  - tags_data.zip
```

### Git History (commit 334585b)
```
tools/importer/blog-pages-all.json        - All blog content
tools/importer/blog-urls-clean.txt        - 345 blog URLs
tools/importer/dam-import/dam-to-source.json - Image mappings
tools/importer/build-blog-package.js      - Package builder script
```

---

## Migration Timeline

| Date | Action | Output |
|---|---|---|
| 2026-05-11 | Expert pages migration (65 pages) | `experts-final.zip` |
| 2026-05-12 | Blog pages migration (344 pages) | `blogs-pages-only.zip` + DAM packages |
| 2026-05-13 | Blog page fixes (template, content-module, Scene7) | Updated packages |
| 2026-05-15 | Taxonomy resolution + package (479 pages) | `taxonomy-all-pages.zip` |
| 2026-05-19 | New pages content (86 pages) | `new-pages-content.zip` |
| 2026-05-19 | Full migration report | `MIGRATION-FULL-REPORT.csv` |

---

## Reproduction Steps

### To rebuild taxonomy package:
1. Load `taxonomy-full.csv` and `full-tag-tree.json`
2. For each CSV row, resolve tag values using leaf-slug lookup + manual overrides
3. Generate `_jcr_content/.content.xml` with only `jcr:primaryType` + tag properties
4. Package with filter `mode="update"` at `{page}/jcr:content` level

### To rebuild blog content package:
1. Load `blog-pages-all.json` for content
2. Load `dam-to-source.json` for Scene7 image URLs
3. Generate page XML using the content-module block pattern
4. Use Scene7 URLs for hero images (not DAM paths)
5. Package with filter `mode="merge"` for new pages or `mode="replace"` if overwriting

### To add taxonomy to a single page:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="cq:PageContent"
    pillars="[mobility-global:pillars/planning-solutions]"
    topic="[mobility-global:insights-and-intelligence/topic/electrification/ev-battery-technology]"
    theme="[mobility-global:insights-and-intelligence/theme/electric-vehicles]"
    breadcrumb-override=""/>
```
Filter: `<filter root="{page-path}/jcr:content" mode="update"/>`
