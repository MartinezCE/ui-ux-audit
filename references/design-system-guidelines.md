# Design system guidelines

## 1. Start from what exists
Before defining anything, list the current mechanism and every token-like value:
- CSS custom properties (`:root`, `[data-theme]`), Tailwind `theme.extend` / `@theme`, SCSS/LESS variables, CSS-in-JS theme objects (styled-components, Emotion), MUI/Chakra/Mantine/Ant/Vuetify themes, design-token JSON (Style Dictionary, Tokens Studio).
- Hardcoded values in components (hex colors, px paddings). Count them; their number drives the migration plan.

Keep the existing mechanism unless it truly cannot express the system. Changing the token mechanism is an architectural decision; present it to the user separately.

## 2. Token layers
1. **Primitive (reference) tokens** — raw palette and scales: `--blue-600: #2453d4`, `--space-4: 16px`. Not used directly in components.
2. **Semantic tokens** — purpose-based, what components consume: `--color-primary`, `--color-text-secondary`, `--color-border`, `--color-danger`, `--space-stack-md`.
3. **Component tokens** (optional, only for complex libraries) — `--button-primary-bg`.

Name by role, never by value (`--color-danger`, not `--color-red`). Adapt casing and prefixing to the project (`colors.text.primary` in a JS theme, `text-primary` in Tailwind).

## 3. Required token set
- **Color:** primary (+ hover, active, subtle, on-primary), secondary, accent, semantic (success, warning, danger, info — each with fg/bg/border variants), background, surface (1–3 elevation levels), border (default, strong, subtle), text (primary, secondary, tertiary/muted, disabled, inverse, link), focus.
- **Typography:** families (sans/serif/mono as needed), a modular scale (e.g. 12, 14, 16, 18, 20, 24, 30, 36, 48), weights actually loaded, line heights (tight ~1.2 for headings, 1.5 for body), letter spacing for small caps/labels. Define text styles as combinations (`heading-lg`, `body-md`, `label-sm`, `caption`).
- **Spacing:** base 4 or 8 scale (0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64…).
- **Radius:** none, sm, md, lg, full. Pick 2–3 that express the shape language.
- **Elevation/shadows:** 0–4 levels tied to meaning (raised card, dropdown, modal, toast).
- **Breakpoints:** reuse existing ones; document min-widths.
- **Motion:** durations (100/150/250/400ms), easings, and the reduced-motion fallback.
- **Focus:** ring width, offset, color, and how it adapts on dark/colored surfaces.
- **Z-index:** named layers (dropdown, sticky, overlay, modal, toast).

## 4. Theming
- If dark mode exists or is requested, define semantic tokens per theme; primitives stay shared. Check every text/surface pair in both themes with `contrast.mjs`.
- Do not simply invert colors; dark surfaces need lower saturation and elevation via lighter surfaces rather than shadows.

## 5. Component guidelines
For each component define: anatomy, variants, sizes, states (default, hover, focus-visible, active, disabled, loading, error, selected), tokens used, spacing, behavior, keyboard interaction, accessibility notes, do/don't.

Minimum set: Button, Input, Select, Checkbox, Radio, Switch, Card, Table, Navigation, Sidebar, Header, Modal, Dropdown/Menu, Tooltip, Toast, Alert, Badge, Tabs, Pagination, Empty state, Loading (spinner, skeleton, progress).

Key expectations:
- **Buttons:** hierarchy primary/secondary/tertiary(ghost)/destructive; consistent heights per size (e.g. 32/40/48); loading state keeps width; icon-only buttons have accessible names.
- **Inputs/Selects:** label, helper, error text; 3:1 border contrast; error state uses color + icon + text; same height as buttons of the same size.
- **Tables:** sticky header for long tables, right-aligned numbers, tabular numerals, row hover, clear sort indicators, empty/loading/error states, responsive strategy (scroll container, column priority or card view).
- **Modals:** focus trap, Escape to close, return focus, max-width tokens, scroll inside body not page, destructive confirmations name the object.
- **Toasts/Alerts:** semantic variants, `role="status"`/`alert` correctly, auto-dismiss only for non-critical messages, pause on hover.
- **Navigation/Sidebar:** current location clearly indicated (not only by color), collapsible behavior defined per breakpoint.
- **Empty states:** explain what goes here and offer the next action.

## 6. Component library decisions
- If a library is in use (MUI, shadcn/ui, Ant, Vuetify, PrimeNG, Bootstrap…), express the new direction through its theming layer first.
- Replacing the library is out of scope for a visual redesign unless the user approves it as a separate decision with cost/risk analysis.
