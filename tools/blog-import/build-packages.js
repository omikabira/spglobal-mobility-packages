#!/usr/bin/env node
/* Builds two JCR content packages from extracted page JSON:
   1) pages package  -> cq:Page nodes (full metadata, publish date, SEO image)
   2) assets package -> dam:Asset nodes (binary + web rendition) under
      /content/dam/mobility-global/en-us/blogs  (referenced from authoring)
*/
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const ROOT = '/workspace/current/tools/blog-import';
const EXTRACT = path.join(ROOT, process.env.EXTRACT_DIR || 'extract');
const OUT = path.join(ROOT, 'build');
const PKG_BASE = process.env.PKG_BASE || 'mobility-global-blogs-may2026';
const DAM_BASE = '/content/dam/mobility-global/en-us/blogs';
const PAGE_BASE = '/content/mobility-global/en-us/automotive-insights/blogs';
const TEMPLATE = '/conf/mobilityglobal/settings/wcm/templates/insight-details';
const MODEL_FIELDS_PAGE = '[pageType@select,breadcrumb-override@select,overview-enabled@select,image@reference,lottieLink@aem-content,titlePosition@text,eventDateTime@date-time,eventEndDateTime@date-time,articlePublishDate@date-time,eventLocation@text,timeToRead@text,eventLink@aem-content,assetAttributes@aem-tag,audienceRole@aem-tag,brandDataSource@aem-tag,campaignType@aem-tag,contentFormat@aem-tag,eventFormat@aem-tag,industrySector@aem-tag,insightsThoughtLeaderContentType@aem-tag,marketConditions@aem-tag,needStates@aem-tag,pillars@aem-tag,platforms@aem-tag,productCapability@aem-tag,productFamily@aem-tag,marketSalesRegion@aem-tag,marketRegion@aem-tag,marketCountry@aem-tag,regulatoryContext@aem-tag,segmentationUserContext@aem-tag,series@aem-tag,servicesAdvisory@aem-tag,theme@aem-tag,timeHorizon@aem-tag,topic@aem-tag,vehicleTypeSegment@aem-tag,workflowStage@aem-tag]';

const NOW = '2026-06-16 10:00:00 GMT+0000';
const AGENT = 'migration-agent';

// ---- helpers ----------------------------------------------------------------
function xmlAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
// richtext stored as an escaped HTML string inside an XML attribute
function rich(html) { return xmlAttr(html); }

function slugifyImg(name) {
  return name.toLowerCase()
    .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

// Scene7 base URL (strip query/preset) and id
function scene7Id(src) {
  let u = decodeURIComponent(src.split('?')[0]);
  const id = u.split('/').pop();
  return id;
}
function downloadBase(src) {
  // keep the Scene7 preset query — bare URLs 403 for some assets
  return src;
}
function get(url, dest) {
  // Scene7 needs the path %20-encoded but the $preset$ query kept verbatim
  const qIdx = url.indexOf('?');
  const pathPart = qIdx === -1 ? url : url.slice(0, qIdx);
  const queryPart = qIdx === -1 ? '' : url.slice(qIdx);
  // decode first so already-encoded %20 isn't double-encoded to %2520
  const reqUrl = encodeURI(decodeURIComponent(pathPart)) + queryPart;
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(reqUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) { file.close(); try { fs.unlinkSync(dest); } catch (_) {} return reject(new Error('HTTP ' + res.statusCode + ' for ' + reqUrl)); }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    });
    req.setTimeout(20000, () => { req.destroy(new Error('timeout ' + reqUrl)); });
    req.on('error', (e) => { try { fs.unlinkSync(dest); } catch (_) {} reject(e); });
  });
}

// parse "DD/MM/YYYY-HH:MM:SS" -> "Thu Jun 12 2025 00:00:00 GMT+0000"
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function publishDate(meta) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(meta || '');
  if (!m) return null;
  const d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  return `${DOW[d.getUTCDay()]} ${MON[d.getUTCMonth()]} ${String(+m[1]).padStart(2,'0')} ${m[3]} 00:00:00 GMT+0000`;
}

// content-format tag from "Article"/"News"
function contentFormatTag(taxonomy) {
  const ct = (taxonomy && taxonomy['Content Type'] && taxonomy['Content Type'][0]) || '';
  if (/news/i.test(ct)) return 'mobility-global:system-and-structural-tags/content-formats/written-formats/press-release';
  return 'mobility-global:system-and-structural-tags/content-formats/written-formats/short-form-article';
}

// ---- gather image map -------------------------------------------------------
const pages = [];
const pageFiles = fs.readdirSync(EXTRACT).filter(f => /^page\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
for (const f of pageFiles) {
  pages.push(JSON.parse(fs.readFileSync(path.join(EXTRACT, f), 'utf8')));
}

// imageMap: scene7-src (no query) -> { damPath, file, downloadUrl }
const assets = new Map();
function registerAsset(src, preferName) {
  if (!src) return null;
  // author images that are already DAM paths on the source site -> re-home to blogs folder
  let fileBase, downloadUrl;
  if (/^https?:\/\//i.test(src)) {
    fileBase = preferName ? slugifyImg(preferName) : slugifyImg(scene7Id(src));
    downloadUrl = downloadBase(src);
  } else {
    // a /content/dam/... path from spglobal (author headshots) — cannot download; skip binary
    fileBase = preferName ? slugifyImg(preferName) : slugifyImg(src.split('/').pop());
    downloadUrl = null;
  }
  const fileName = fileBase + '.jpg';
  const damPath = `${DAM_BASE}/${fileName}`;
  if (!assets.has(damPath)) assets.set(damPath, { damPath, fileName, downloadUrl, src });
  return damPath;
}

// register hero + body images for each page; rewrite segment image srcs to DAM paths
for (const p of pages) {
  p.heroDam = registerAsset(p.heroImage, `${p.slug}-hero`);
  // author headshots intentionally skipped — not shipped in either package
  for (const seg of p.segments) {
    if (seg.type === 'image') seg.dam = registerAsset(seg.src);
  }
}

// ---- build page XML ---------------------------------------------------------
function buildPageXml(p) {
  const pub = publishDate(p.metaPublished);
  const cfTag = contentFormatTag(p.taxonomy);
  const heroHeading = `<h4>${p.h1}</h4>`;
  const heroDate = p.heroDate ? p.heroDate.replace(/\b([A-Z]{2,})\b/g, (w) => w[0] + w.slice(1).toLowerCase()) : '';

  let x = '';
  x += `<?xml version="1.0" encoding="UTF-8"?>\n`;
  x += `<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"\n`;
  x += `    jcr:primaryType="cq:Page">\n`;
  x += `    <jcr:content\n`;
  x += `        jcr:primaryType="cq:PageContent"\n`;
  x += `        jcr:title="${xmlAttr(p.title)}"\n`;
  x += `        jcr:description="${xmlAttr(p.metaDesc)}"\n`;
  x += `        sling:resourceType="core/franklin/components/page/v1/page"\n`;
  x += `        cq:template="${TEMPLATE}"\n`;
  x += `        pageType="Insights Details Page"\n`;
  x += `        overview-enabled="true"\n`;
  x += `        breadcrumb-override=""\n`;
  x += `        unsetTitle="false"\n`;
  x += `        canonical="${xmlAttr(p.canonical)}"\n`;
  if (pub) x += `        articlePublishDate="${pub}"\n`;
  x += `        image="${xmlAttr(p.heroDam)}"\n`;
  x += `        contentFormat="[${cfTag}]"\n`;
  x += `        modelFields="${MODEL_FIELDS_PAGE}"\n`;
  x += `        jcr:created="${NOW}"\n`;
  x += `        jcr:createdBy="${AGENT}"\n`;
  x += `        cq:lastModified="${NOW}"\n`;
  x += `        cq:lastModifiedBy="${AGENT}">\n`;
  x += `        <image jcr:primaryType="nt:unstructured"/>\n`;
  x += `        <root jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/root/v1/root">\n`;

  // --- section hero ---
  x += `            <section_hero jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/section/v1/section"\n`;
  x += `                model="section" aueComponentId="section" style="[bg-grey]" name="Section - Hero"\n`;
  x += `                modelFields="[name@text,id@text,style@multiselect]">\n`;
  x += `                <hero jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/block/v1/block"\n`;
  x += `                    name="Hero" model="hero" aueComponentId="hero" classes="hero-black-colored-right"\n`;
  x += `                    heading="${rich(heroHeading)}"\n`;
  x += `                    description="${rich('<p>' + heroDate + '</p>')}"\n`;
  x += `                    image="${xmlAttr(p.heroDam)}"\n`;
  x += `                    imageAlt="${xmlAttr(p.h1)}"\n`;
  x += `                    playOnce="false"\n`;
  x += `                    modelFields="[classes@select,image@reference,imageAlt@text,eyebrow text@text,heading@richtext,description@richtext,button1@aem-content,button1Title@text,button1Text@text,button1Type@select,button2@aem-content,button2Title@text,button2Text@text,button2Type@select,tagVariation@select,tag-title@text,playOnce@boolean]"/>\n`;
  x += `            </section_hero>\n`;

  // --- section insight details (only if author present) ---
  if (p.authors && p.authors.length) {
    const a = p.authors[0];
    const authorImg = p.authorDam || '';
    x += `            <section_insights_detail jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/section/v1/section"\n`;
    x += `                model="section" aueComponentId="section" name="Section - Insight Details"\n`;
    x += `                modelFields="[name@text,id@text,style@multiselect]">\n`;
    x += `                <block jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/block/v1/block"\n`;
    x += `                    name="Insight Details" model="insight-details" aueComponentId="insight-details"\n`;
    x += `                    authorVariation="page-url"\n`;
    x += `                    authorName="${xmlAttr(a.name)}"\n`;
    if (a.href) x += `                    authorLink="${xmlAttr(a.href)}"\n`;
    if (p.authorProfileLink) x += `                    authorProfileLink="${xmlAttr(p.authorProfileLink)}"\n`;
    if (authorImg) x += `                    authorImage="${xmlAttr(authorImg)}"\n`;
    x += `                    showTimeToRead="no" showTags="no" showInsightsThoughtLeaderContentType="yes"\n`;
    x += `                    showTopic="yes" showTheme="yes" showSeries="yes" showRegionMarket="yes" showEventFormat="yes"\n`;
    x += `                    modelFields="[authorVariation@select,authorProfileLink@aem-content,authorName@text,authorLink@aem-content,authorImage@reference,showTimeToRead@select,showTags@select,showInsightsThoughtLeaderContentType@select,showTopic@select,showTheme@select,showSeries@select,showRegionMarket@select,showEventFormat@select]"/>\n`;
    x += `            </section_insights_detail>\n`;
  }

  // --- section summary ---
  if (p.summaryHtml) {
    x += `            <section_summary jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/section/v1/section"\n`;
    x += `                model="section" aueComponentId="section" style="[bg-quiet-light]" name="Section - Article Summary"\n`;
    x += `                modelFields="[name@text,id@text,style@multiselect]">\n`;
    x += `                <tag jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/block/v1/block"\n`;
    x += `                    name="Tag" model="tag" aueComponentId="tag" tagVariation="dark" tag-title="Article Summary"\n`;
    x += `                    modelFields="[tagVariation@select,tag-title@text,tagIcon@select]"/>\n`;
    x += `                <content_module jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/block/v1/block"\n`;
    x += `                    name="Content Module" model="content-module" aueComponentId="content-module" classes="full-width-text"\n`;
    x += `                    description="${rich(p.summaryHtml)}"\n`;
    x += `                    modelFields="[classes@select,eyebrow@text,description@richtext,description2@richtext,button1@aem-content,button1Title@text,button1Text@text,button1Type@select]"/>\n`;
    x += `            </section_summary>\n`;
  }

  // --- section body ---
  x += `            <section_body jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/section/v1/section"\n`;
  x += `                model="section" aueComponentId="section" name="Section - Article Body"\n`;
  x += `                modelFields="[name@text,id@text,style@multiselect]">\n`;
  let ti = 0, ii = 0;
  for (const seg of p.segments) {
    if (seg.type === 'text') {
      ti++;
      x += `                <content_${ti} jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/block/v1/block"\n`;
      x += `                    name="Content Module" model="content-module" aueComponentId="content-module" classes="full-width-text"\n`;
      x += `                    description="${rich(seg.html)}"\n`;
      x += `                    modelFields="[classes@select,eyebrow@text,description@richtext,description2@richtext,button1@aem-content,button1Title@text,button1Text@text,button1Type@select]"/>\n`;
    } else {
      ii++;
      x += `                <image_${ii} jcr:primaryType="nt:unstructured" sling:resourceType="core/franklin/components/image/v1/image"\n`;
      x += `                    aueComponentId="image" image="${xmlAttr(seg.dam)}" imageAlt="${xmlAttr(seg.alt || '')}"\n`;
      x += `                    modelFields="[image@reference,imageAlt@text]"/>\n`;
    }
  }
  x += `            </section_body>\n`;
  x += `        </root>\n`;
  x += `    </jcr:content>\n`;
  x += `</jcr:root>\n`;
  return x;
}

// ---- write pages package ----------------------------------------------------
function mkdirp(d) { fs.mkdirSync(d, { recursive: true }); }
function writeFile(f, c) { mkdirp(path.dirname(f)); fs.writeFileSync(f, c); }

const pagesPkg = path.join(OUT, 'pages-pkg');
fs.rmSync(pagesPkg, { recursive: true, force: true });
const pageFilters = [];
for (const p of pages) {
  // jcrPath lets a page opt out of the default /blogs/{year}/{month}/{slug} layout
  // (e.g. rapid-impact-analysis lives at a flat path with no year/month)
  const pagePath = p.jcrPath || `${PAGE_BASE}/${p.year}/${p.month}/${p.slug}`;
  pageFilters.push(pagePath);
  writeFile(path.join(pagesPkg, 'jcr_root' + pagePath, '.content.xml'), buildPageXml(p));
}
// folder .content.xml for cq:Page ancestors so nodes type correctly is not required with replace mode at leaf
writeVault(pagesPkg, PKG_BASE + '-pages', pageFilters.map(r => ({ root: r, mode: 'replace' })));

// ---- write assets package ---------------------------------------------------
const assetsPkg = path.join(OUT, 'assets-pkg');
fs.rmSync(assetsPkg, { recursive: true, force: true });

function assetContentXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:dam="http://www.day.com/dam/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0">\n` +
    `    <jcr:content jcr:primaryType="dam:AssetContent">\n` +
    `        <metadata jcr:primaryType="nt:unstructured" dc:format="image/jpeg"\n` +
    `            xmlns:dc="http://purl.org/dc/elements/1.1/"/>\n` +
    `        <renditions jcr:primaryType="nt:folder"/>\n` +
    `    </jcr:content>\n` +
    `</jcr:root>\n`;
}

const SKIP_ASSETS = process.env.SKIP_ASSETS === '1';

(async () => {
  if (SKIP_ASSETS) {
    zip(pagesPkg, path.join(OUT, PKG_BASE + '-pages.zip'));
    console.log(`\nContent-only build. Pages reference DAM paths under ${DAM_BASE} (binaries not shipped).`);
    console.log(`Unique image DAM paths referenced: ${assets.size}`);
    return;
  }
  const tmp = path.join(OUT, 'img-tmp');
  mkdirp(tmp);
  let ok = 0, skip = 0, idx = 0;
  const total = assets.size;
  for (const a of assets.values()) {
    idx++;
    const assetDir = path.join(assetsPkg, 'jcr_root' + a.damPath);
    if (!a.downloadUrl) { console.log(`[${idx}/${total}] SKIP (no source binary): ` + a.fileName); skip++; continue; }
    const tmpFile = path.join(tmp, a.fileName);
    let okDl = false;
    for (let attempt = 1; attempt <= 2 && !okDl; attempt++) {
      try { await get(a.downloadUrl, tmpFile); okDl = true; }
      catch (e) { if (attempt === 2) console.log(`[${idx}/${total}] FAIL ` + a.fileName + ' : ' + e.message); }
    }
    if (!okDl) { skip++; continue; }
    console.log(`[${idx}/${total}] ok ` + a.fileName);
    writeFile(path.join(assetDir, '.content.xml'), assetContentXml());
    // original rendition (binary)
    const rend = path.join(assetDir, '_jcr_content', 'renditions');
    mkdirp(rend);
    fs.copyFileSync(tmpFile, path.join(rend, 'original'));
    // web rendition so the asset is delivered as already-processed
    fs.copyFileSync(tmpFile, path.join(rend, 'cq5dam.web.1280.1280.jpeg'));
    ok++;
  }
  writeVault(assetsPkg, PKG_BASE + '-assets', [{ root: DAM_BASE, mode: 'merge' }]);
  console.log(`\nAssets: ${ok} downloaded, ${skip} skipped.`);
  console.log(`Total unique asset paths: ${assets.size}`);

  // zip both
  zip(pagesPkg, path.join(OUT, PKG_BASE + '-pages.zip'));
  zip(assetsPkg, path.join(OUT, PKG_BASE + '-assets.zip'));
  console.log('\nDone.');
})();

// ---- vault metadata + zip ---------------------------------------------------
function writeVault(pkgDir, name, filters) {
  const props =
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
  <entry key="name">${name}</entry>
  <entry key="group">mobility-global</entry>
  <entry key="version">1.0.0</entry>
  <entry key="packageType">content</entry>
</properties>
`;
  const filterXml =
`<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
${filters.map(f => `    <filter root="${f.root}" mode="${f.mode}"/>`).join('\n')}
</workspaceFilter>
`;
  writeFile(path.join(pkgDir, 'META-INF', 'vault', 'properties.xml'), props);
  writeFile(path.join(pkgDir, 'META-INF', 'vault', 'filter.xml'), filterXml);
}

function zip(pkgDir, outZip) {
  try { fs.unlinkSync(outZip); } catch (_) {}
  const AdmZip = require('adm-zip');
  const z = new AdmZip();
  for (const top of ['jcr_root', 'META-INF']) {
    const abs = path.join(pkgDir, top);
    if (fs.existsSync(abs)) z.addLocalFolder(abs, top);
  }
  z.writeZip(outZip);
  const sz = fs.statSync(outZip).size;
  console.log(`Packed ${path.basename(outZip)} (${(sz/1024).toFixed(0)} KB)`);
}
