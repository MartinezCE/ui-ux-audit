#!/usr/bin/env node
// WCAG 2.x contrast checker. Zero dependencies, read-only.
//
// Usage:
//   node contrast.mjs "#1f2937" "#ffffff"            one pair
//   node contrast.mjs "#666/#fff" "#2563eb/#ffffff"    several fg/bg pairs
//   node contrast.mjs --json pairs.json               [{ "fg": "#..", "bg": "#..", "label": "..", "large": false, "ui": false }]
//   node contrast.mjs --inventory styles.json         output of style-inventory.js (uses its textPairs)
//
// Accepts #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(). Alpha in fg is composited over bg.
// Thresholds: 4.5 normal text, 3.0 large text (>=24px or >=18.66px bold), 3.0 UI components (1.4.11).

import { readFileSync } from 'node:fs';

function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) throw new Error(`Bad hex: ${input}`);
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) throw new Error(`Bad rgb: ${input}`);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }
  throw new Error(`Unsupported color: ${input}`);
}

function composite(fg, bg) {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

function luminance({ r, g, b }) {
  const ch = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrast(fgInput, bgInput) {
  const bg = parseColor(bgInput);
  const fg = composite(parseColor(fgInput), { ...bg, a: 1 });
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function verdict(ratio, { large = false, ui = false } = {}) {
  const need = ui || large ? 3 : 4.5;
  return { need, pass: ratio >= need, aaa: ratio >= (large ? 4.5 : 7) };
}

function report(items) {
  const rows = items.map((it) => {
    const ratio = contrast(it.fg, it.bg);
    const v = verdict(ratio, it);
    return {
      label: it.label ?? '',
      fg: it.fg,
      bg: it.bg,
      ratio: Math.round(ratio * 100) / 100,
      kind: it.ui ? 'ui' : it.large ? 'large-text' : 'text',
      required: v.need,
      AA: v.pass ? 'PASS' : 'FAIL',
      AAA_text: it.ui ? '-' : v.aaa ? 'PASS' : 'FAIL',
      count: it.count ?? undefined,
    };
  });
  console.table(rows);
  const failures = rows.filter((r) => r.AA === 'FAIL').length;
  console.log(`${rows.length} pair(s) checked, ${failures} AA failure(s).`);
  process.exitCode = failures ? 1 : 0;
}

// Split "fg/bg" at a slash outside parentheses (so rgb(0 0 0 / 50%) survives).
function splitPair(arg) {
  let depth = 0;
  for (let i = 0; i < arg.length; i++) {
    if (arg[i] === '(') depth++;
    else if (arg[i] === ')') depth--;
    else if (arg[i] === '/' && depth === 0) return [arg.slice(0, i), arg.slice(i + 1)];
  }
  return null;
}

const args = process.argv.slice(2);
try {
  if (!args.length || args[0] === '-h' || args[0] === '--help') {
    console.log(readFileSync(new URL(import.meta.url)).toString().split('\n').slice(1, 12).join('\n'));
  } else if (args[0] === '--json') {
    report(JSON.parse(readFileSync(args[1], 'utf8')));
  } else if (args[0] === '--inventory') {
    const inv = JSON.parse(readFileSync(args[1], 'utf8'));
    const all = inv.textPairs ?? [];
    const overImage = all.filter((p) => p.overImage || !p.bg);
    if (overImage.length) console.log(`${overImage.length} text style(s) sit over images/gradients: check those manually on the worst area.`);
    report(all.filter((p) => p.bg).map((p) => ({ fg: p.fg, bg: p.bg, large: p.large, label: p.sample, count: p.count })));
  } else if (args.every((a) => splitPair(a))) {
    report(args.map((a) => { const [fg, bg] = splitPair(a); return { fg, bg }; }));
  } else if (args.length === 2) {
    report([{ fg: args[0], bg: args[1] }]);
  } else {
    throw new Error('Pass two colors, fg/bg pairs, --json <file> or --inventory <file>.');
  }
} catch (err) {
  console.error(err.message);
  process.exitCode = 2;
}
