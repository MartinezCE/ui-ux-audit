# Responsive audit guidelines

## Default viewports
| Name | Width × height | Purpose |
|---|---|---|
| desktop | 1440 × 900 | Large desktop |
| laptop | 1280 × 800 | Common laptop |
| tablet | 768 × 1024 | Portrait tablet, breakpoint edges |
| mobile | 390 × 844 | Modern phone |

Also check 320px width once for reflow (WCAG 1.4.10), and the widths just below and above each project breakpoint (e.g. 767/768, 1023/1024), where layouts usually break. If the project defines other breakpoints or is desktop-only by design (internal tools), adapt and record the decision.

Use `browser_resize` and wait for layout to settle before each screenshot. Use full-page screenshots for long pages, plus a viewport-only shot for above-the-fold judgments.

## What to look for
- **Overflow:** horizontal scrollbars on the page body; text or buttons clipped; long words/emails/IDs breaking layouts. In `browser_evaluate`: `document.documentElement.scrollWidth > window.innerWidth`.
- **Navigation:** how the sidebar/header collapses; whether the mobile menu is reachable by keyboard and closes properly; current location visible on mobile.
- **Tables:** strategy at narrow widths (scroll container with visible affordance, column hiding by priority, stacked cards). Page-level horizontal scroll is a defect; contained scroll is acceptable.
- **Forms:** single column on mobile, inputs full width, correct input types (`email`, `tel`, `number`, `inputmode`), labels not truncated.
- **Modals:** fit at 390px, with internal scroll; full-screen sheet on mobile when content is long.
- **Touch targets:** ≥24×24px (AA), 44×44px recommended for primary actions; enough spacing between adjacent targets.
- **Typography:** body ≥16px on mobile (also avoids iOS input zoom), headings scaled down but still hierarchical, line length 45–80 characters on desktop.
- **Images/media:** aspect ratio preserved, no layout shift while loading, art direction where needed.
- **Fixed/sticky elements:** don't cover content or focused elements; don't eat more than ~20% of a mobile viewport.
- **Container widths:** max content width on large screens (reading text ~65–75ch; dashboards may use fluid grids with sensible max).

## Recording findings
Name the viewport, the screen and the element. Example: "Orders table at 390px: page scrolls horizontally (scrollWidth 812 > 390); action column unreachable without scrolling. Proposed: wrap table in scroll container with shadow affordance, or switch to card list below 768px."
