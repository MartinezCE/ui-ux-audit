// Read-only style inventory for the current page.
// Paste the whole function below as the `function` argument of Playwright MCP `browser_evaluate`.
// It changes nothing on the page and sends nothing anywhere. It returns JSON with:
//   fonts, fontSizes, colors, backgrounds, borders, radii, shadows, spacing (counts),
//   textPairs (fg/effective bg for contrast checks), smallTargets (< 24x24 interactive elements),
//   overflow (horizontal page overflow), headings outline, and images missing alt.
// Text content samples are truncated to 30 chars; avoid running it on screens showing personal data,
// or delete the `sample` fields before saving.
() => {
  const MAX_ELEMENTS = 4000;
  const count = (map, key) => { if (key) map[key] = (map[key] || 0) + 1; };
  const top = (map, n = 40) => Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([value, uses]) => ({ value, uses }));
  const transparent = (c) => !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c);

  const effectiveBg = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return { color: null, image: true };
      if (!transparent(cs.backgroundColor)) return { color: cs.backgroundColor, image: false };
    }
    return { color: 'rgb(255, 255, 255)', image: false };
  };

  const fonts = {}, sizes = {}, colors = {}, bgs = {}, borders = {}, radii = {}, shadows = {}, spacing = {};
  const pairs = {};
  const smallTargets = [];
  const els = Array.from(document.querySelectorAll('body *')).slice(0, MAX_ELEMENTS);

  for (const el of els) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    const hasOwnText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasOwnText) {
      count(fonts, cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
      count(sizes, `${cs.fontSize} / ${cs.fontWeight} / lh ${cs.lineHeight}`);
      count(colors, cs.color);
      const bg = effectiveBg(el);
      const px = parseFloat(cs.fontSize);
      const large = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
      const key = `${cs.color}|${bg.image ? 'IMAGE' : bg.color}|${large}`;
      if (!pairs[key]) {
        pairs[key] = { fg: cs.color, bg: bg.image ? null : bg.color, overImage: bg.image, large, count: 0,
          sample: el.textContent.trim().slice(0, 30) };
      }
      pairs[key].count++;
    }
    if (!transparent(cs.backgroundColor)) count(bgs, cs.backgroundColor);
    if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) count(borders, `${cs.borderTopWidth} ${cs.borderTopColor}`);
    if (cs.borderTopLeftRadius !== '0px') count(radii, cs.borderTopLeftRadius);
    if (cs.boxShadow !== 'none') count(shadows, cs.boxShadow);
    for (const p of ['paddingTop', 'paddingLeft', 'marginTop', 'marginBottom', 'rowGap', 'columnGap']) {
      const v = cs[p];
      if (v && v !== '0px' && v !== 'normal' && v !== 'auto') count(spacing, v);
    }

    const interactive = el.matches('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=link], [role=checkbox], [role=tab], [tabindex]:not([tabindex="-1"])');
    if (interactive && (rect.width < 24 || rect.height < 24)) {
      smallTargets.push({
        tag: el.tagName.toLowerCase(),
        name: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').trim().slice(0, 30),
        size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      });
    }
  }

  const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => ({
    level: Number(h.tagName[1]), text: h.textContent.trim().slice(0, 50), size: getComputedStyle(h).fontSize,
  }));

  return {
    url: location.pathname,
    viewport: `${innerWidth}x${innerHeight}`,
    elementsScanned: els.length,
    overflow: { scrollWidth: document.documentElement.scrollWidth, innerWidth, horizontalOverflow: document.documentElement.scrollWidth > innerWidth },
    rootCustomProperties: Array.from(document.styleSheets).flatMap((s) => {
      try { return Array.from(s.cssRules); } catch { return []; }
    }).filter((r) => r.selectorText === ':root').flatMap((r) => Array.from(r.style).filter((p) => p.startsWith('--'))).slice(0, 200),
    fonts: top(fonts), fontSizes: top(sizes), colors: top(colors), backgrounds: top(bgs),
    borders: top(borders), radii: top(radii), shadows: top(shadows, 15), spacing: top(spacing),
    textPairs: Object.values(pairs).sort((a, b) => b.count - a.count).slice(0, 60),
    smallTargets: smallTargets.slice(0, 50),
    headings,
    imagesMissingAlt: Array.from(document.querySelectorAll('img:not([alt])')).map((i) => i.currentSrc.split('/').pop()).slice(0, 30),
  };
}
