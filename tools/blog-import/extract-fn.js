// Reusable in-browser extractor for S&P Global automotive-insights blog pages.
// Returns a normalized JSON object describing one page.
window.__extractBlog = () => {
  const clean = (el) => {
    const c = el.cloneNode(true);
    c.querySelectorAll('script,style,button,svg,noscript').forEach(n => n.remove());
    c.querySelectorAll('*').forEach(n => {
      [...n.attributes].forEach(a => {
        if (!['href', 'src', 'alt'].includes(a.name)) n.removeAttribute(a.name);
      });
    });
    // unwrap spans (keep text)
    return c;
  };
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

  const out = {};
  out.url = location.href;
  out.title = document.title;
  out.h1 = norm(document.querySelector('h1')?.innerText);
  out.metaDesc = document.querySelector('meta[name="description"]')?.content || null;
  out.canonical = document.querySelector('link[rel="canonical"]')?.href || null;
  out.ogImage = document.querySelector('meta[property="og:image"]')?.content || null;
  out.metaPublished = document.querySelector('meta[name="publishdate"],meta[property="article:published_time"],meta[name="date"]')?.content || null;

  const main = document.querySelector('main');
  const h1 = document.querySelector('h1');

  // hero image: first <img> in main (inside the banner)
  const heroImgEl = main.querySelector('img');
  out.heroImage = heroImgEl ? heroImgEl.getAttribute('src') : null;

  // hero date: paragraph near h1 (the overline)
  let heroDate = null;
  if (h1) {
    const cont = h1.parentElement;
    const p = cont && cont.querySelector('p');
    if (p) heroDate = norm(p.innerText);
  }
  out.heroDate = heroDate;

  // byline authors
  const authors = [];
  let bylineEl = null;
  main.querySelectorAll('p').forEach(p => {
    if (p.querySelector('a[href*="blogs#q="]')) {
      if (!bylineEl) bylineEl = p;
      p.querySelectorAll('a[href*="blogs#q="]').forEach(a => {
        authors.push({ name: norm(a.innerText), href: a.getAttribute('href') });
      });
    }
  });
  out.authors = authors;

  // author image (headshot)
  out.authorImage = main.querySelector('img[alt*="author" i],img[src*="contact-headshots"],img[src*="experts"]')?.getAttribute('src') || null;

  // summary
  let summaryEl = null, rightRailEl = null, recommendedEl = null;
  main.querySelectorAll('h4').forEach(h => {
    const t = norm(h.innerText);
    if (t === 'Article Summary') summaryEl = h.parentElement;
    if (t === 'Recommended for you') recommendedEl = h.closest('div');
  });
  // right rail: container holding Content Type / Themes headings
  const ctH = [...main.querySelectorAll('h4')].find(h => norm(h.innerText) === 'Content Type');
  if (ctH) rightRailEl = ctH.closest('aside') || ctH.parentElement?.parentElement;

  if (summaryEl) {
    const c = clean(summaryEl);
    c.querySelectorAll('h4').forEach(h => h.remove());
    // remove empty button-comment divs
    c.querySelectorAll('div').forEach(d => { if (!norm(d.innerText) && !d.querySelector('img')) d.remove(); });
    out.summaryHtml = c.innerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
  } else out.summaryHtml = null;

  // taxonomy (right rail)
  const tax = {};
  if (rightRailEl) {
    rightRailEl.querySelectorAll('h4').forEach(h => {
      const label = norm(h.innerText);
      if (label === 'Content Type' || label === 'Themes') {
        const vals = [];
        const block = h.parentElement;
        block.querySelectorAll('a').forEach(a => { const t = norm(a.innerText); if (t) vals.push(t); });
        if (!vals.length) block.querySelectorAll('p').forEach(p => { const t = norm(p.innerText); if (t) vals.push(t); });
        tax[label] = vals;
      }
    });
  }
  out.taxonomy = tax;

  // body segments
  const excluded = [summaryEl, rightRailEl, recommendedEl].filter(Boolean);
  const isExcluded = (n) => {
    if (n.closest('nav,header,footer')) return true;
    if (n === h1 || (h1 && h1.contains(n))) return true;
    if (bylineEl && (bylineEl === n || bylineEl.contains(n))) return true;
    return excluded.some(ex => ex === n || ex.contains(n));
  };

  const leaves = [];
  main.querySelectorAll('h2,h3,h4,p,ul,ol,img,blockquote,table').forEach(node => {
    if (isExcluded(node)) return;
    if (node.tagName === 'IMG') {
      if (node === heroImgEl) return; // skip hero
      leaves.push(node); return;
    }
    const txt = norm(node.innerText);
    if (!txt && !node.querySelector('img')) return;
    if (['Recommended for you', 'Content Type', 'Themes', 'Article'].includes(txt)) return;
    // skip date overline + author headshot caption
    if (node.tagName === 'P' && node.parentElement.closest('ul,ol')) return;
    // skip the hero date paragraph
    if (txt === out.heroDate) return;
    leaves.push(node);
  });

  const segments = [];
  let buf = '';
  const flush = () => { if (buf.trim()) segments.push({ type: 'text', html: buf.trim() }); buf = ''; };
  leaves.forEach(node => {
    if (node.tagName === 'IMG') {
      flush();
      segments.push({ type: 'image', src: node.getAttribute('src'), alt: node.getAttribute('alt') || '' });
    } else {
      buf += clean(node).outerHTML.replace(/<!--[\s\S]*?-->/g, '');
    }
  });
  flush();
  out.segments = segments;
  return out;
};
