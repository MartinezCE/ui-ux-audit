# Design System Specification — {{Product name}}

- Direction: {{name}} (approved {{date}})
- Token mechanism: {{CSS variables / Tailwind theme / SCSS / MUI theme …}} (existing: {{yes/no}})
- Naming convention: {{as used by the project}}
- Frontend Design input: Phase 7 section of `03-frontend-design-consultation.md` (status: {{succeeded}})

## 1. Color tokens
### Primitives
| Token | HEX |
|---|---|

### Semantic (light)
| Token | Maps to | HEX | Use |
|---|---|---|---|
| `--color-primary` | | | Primary actions, links |
| `--color-primary-hover` | | | |
| `--color-primary-active` | | | |
| `--color-on-primary` | | | Text on primary |
| `--color-secondary` | | | |
| `--color-accent` | | | |
| `--color-background` | | | App background |
| `--color-surface` | | | Cards, panels |
| `--color-surface-raised` | | | Dropdowns, modals |
| `--color-border` | | | Default borders |
| `--color-border-strong` | | | Input borders (≥3:1) |
| `--color-text-primary` | | | |
| `--color-text-secondary` | | | |
| `--color-text-disabled` | | | |
| `--color-text-inverse` | | | |
| `--color-success` / `-bg` / `-border` | | | |
| `--color-warning` / `-bg` / `-border` | | | |
| `--color-danger` / `-bg` / `-border` | | | |
| `--color-info` / `-bg` / `-border` | | | |
| `--color-focus` | | | Focus ring |

### Semantic (dark) — if applicable
{{same table}}

### Contrast verification
{{paste contrast.mjs output for all text/surface and UI/surface pairs}}

## 2. Typography
| Token | Family | Size | Line height | Weight | Letter spacing | Use |
|---|---|---|---|---|---|---|
| `display` | | | | | | |
| `heading-xl` | | | | | | |
| `heading-lg` | | | | | | |
| `heading-md` | | | | | | |
| `body-lg` | | | | | | |
| `body-md` | | | | | | |
| `body-sm` | | | | | | |
| `label` | | | | | | |
| `caption` | | | | | | |
| `code` | | | | | | |

Font loading: {{self-hosted / next/font / existing}}; weights loaded: {{list}}

## 3. Spacing
| Token | Value |
|---|---|

## 4. Radius
| Token | Value | Use |
|---|---|---|

## 5. Elevation
| Token | Value | Use |
|---|---|---|

## 6. Breakpoints
| Token | Min width |
|---|---|

## 7. Motion
| Token | Value | Use |
|---|---|---|
Reduced motion: {{rule}}

## 8. Focus style
{{ring width, offset, color, behavior on colored surfaces}}

## 9. Z-index layers
| Token | Value |
|---|---|

## 10. Components
For each: anatomy · variants · sizes · states · tokens · keyboard · a11y · do/don't · existing implementation (file) and migration note.

### Button
### Input
### Select
### Checkbox
### Radio
### Switch
### Card
### Table
### Navigation
### Sidebar
### Header
### Modal
### Dropdown / Menu
### Tooltip
### Toast
### Alert
### Badge
### Tabs
### Pagination
### Empty state
### Loading states

## 11. Layout rules
{{grid, container widths, page templates, density modes}}

## 12. Responsive rules
{{per component and page-template behavior at each breakpoint}}

## 13. Out of scope
{{what this spec intentionally does not change}}
