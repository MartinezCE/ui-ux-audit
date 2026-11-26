# Branding and art direction

## 1. Auditing the current brand

### First, separate constraints from opinions
Collect **existing brand constraints** only from evidence:
- Logo files and their colors (`public/`, `assets/`, favicon, manifest `theme_color`)
- Brand docs in the repo (brand guide, Figma links in README, design tokens named after the brand)
- Explicit statements from the user
- Domain requirements (e.g. regulated finance/health tone, mandated legal disclaimers)

Everything else is a proposal. Label it so. If something looks like a brand constraint but isn't documented (e.g. the app's blue), ask whether it is mandatory.

### Analyze
- **Personality:** describe the current impression in 3–5 adjectives and back each with a visual cause ("clinical: pure white surfaces, thin 1px gray borders everywhere, no accent color").
- **Positioning fit:** does the look match the product's audience and price point? (B2B analytics vs consumer wellness vs fintech.)
- **Color identity:** is there an ownable color, or only framework defaults (Bootstrap blue, Tailwind indigo-600, MUI #1976d2)? Default palettes are a finding for brand distinctiveness, not a defect in itself.
- **Typography:** system/default fonts vs chosen faces; does the type carry personality?
- **Iconography:** one icon set or several mixed (stroke widths, filled vs outline, sizes).
- **Shape language:** radii, borders, shadows; are they coherent (soft vs sharp)?
- **Density and rhythm:** airy vs compact; consistent or random.
- **Coherence across screens:** do login, dashboard and settings feel like one product?

## 2. Generating three directions
The directions are developed by the `frontend-design` specialist (Phase 5 brief in [orchestration.md §3](orchestration.md#3-invoking-frontend-design)). This section is what the orchestrator gives it as requirements and then checks in its output. If frontend-design is unavailable, the phase is blocked; these rules are not a substitute.

| | 1. Conservative refinement | 2. Modernization | 3. Full rebrand |
|---|---|---|---|
| Identity | Same personality, cleaned up | Recognizable, updated | New personality |
| Palette | Same hues, fixed scale and contrast | Brand hue kept, new neutrals/accent | New palette (logo may need a new color usage) |
| Typography | Same family, fixed scale | New family compatible in tone | New pairing |
| Components | Unify variants, fix states | New shape language and elevation | New component styling end to end |
| Layout/nav | Fix spacing and alignment | Revised nav pattern if justified | Can rethink layout, IA stays |
| Risk/effort | Low | Medium | High |

Functionality and information architecture stay intact in all three. Direction 3 changes the look and feel, not what the product does.

### Differentiation test (must pass before presenting)
The three directions must differ on at least four of: primary hue family, neutral temperature (warm/cool/pure), typeface category (geometric, humanist, grotesque, serif, mono), radius language, elevation style (flat/borders vs shadows vs tonal surfaces), density, navigation pattern, illustration/icon style. If you could swap the names of two directions without anyone noticing, redo one.

### Avoid generic AI aesthetics
Do not default to: purple-to-blue gradients, glassmorphism everywhere, Inter + indigo + rounded-2xl cards for every direction, emoji as icons, neon on black "for modern". Justify every choice from the product, its users and its constraints.

### Content for each direction
1. **Concept** — one sentence and a short rationale tied to users and positioning
2. **Personality** — 3–5 adjectives with what creates each
3. **Palette** — primitives with HEX, semantic mapping, contrast ratios of key pairs (run `contrast.mjs`)
4. **Typography** — families (with license/source; prefer open-licensed fonts such as Google Fonts or system stacks unless the brand already licenses one), scale, weights
5. **Components** — buttons, inputs, cards, tables, nav: radius, borders, elevation, states
6. **Navigation approach**
7. **Layout approach** — grid, container widths, density
8. **Iconography** — set (prefer the one already installed; propose a change only with reason)
9. **Applied examples** — at least 2–3 real screens of this app described element by element, optionally as HTML mockups in `.ui-audit/mockups/`
10. **Advantages / disadvantages**
11. **Implementation complexity** — S/M/L with the drivers (number of hardcoded values, library theming capacity, number of screens)

### References and inspiration
You may cite categories or well-known patterns ("the data-table density common in financial terminals"), but never copy another product's branding, logo, distinctive illustrations or layout wholesale. Do not use trademarked names in proposed brand assets.
