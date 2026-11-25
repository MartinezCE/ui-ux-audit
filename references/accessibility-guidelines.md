# Accessibility audit (WCAG 2.2 AA)

Screenshots alone never prove compliance. Classify every accessibility finding as one of:

- **Verified violation** — measured or observed directly (contrast ratio computed from real computed colors, missing accessible name in the accessibility snapshot, focus not visible while tabbing).
- **Potential issue** — likely, but needs manual or assistive-technology testing (screen reader announcements, cognitive clarity, complex widgets).
- **Not tested** — say what was out of reach (auth-protected screens, flows you could not trigger).

Never write "the app is WCAG compliant". Write "no violations found in the tested scope" and list the scope.

## Checks and how to perform them

| Check | Criterion | How |
|---|---|---|
| Text contrast | 1.4.3: 4.5:1 normal text, 3:1 large text (≥24px, or ≥18.66px bold) | Get computed `color` and effective background via `style-inventory.js`, run `contrast.mjs`. Watch text over images/gradients: test the worst area. |
| Non-text contrast | 1.4.11: 3:1 for UI component boundaries, focus indicators, icons that convey meaning | Input borders vs background, toggle tracks, chart lines, icon-only buttons. |
| Use of color | 1.4.1 | Status or errors communicated only by color (red border with no text/icon). |
| Keyboard | 2.1.1, 2.1.2 | `browser_press_key` Tab/Shift+Tab/Enter/Space/Escape/Arrow keys through each screen. Note traps, unreachable controls, custom widgets that ignore keys. |
| Focus visible | 2.4.7, 2.4.11 (focus not obscured, AA) | Screenshot after each Tab on key screens. Sticky headers/footers covering focused elements are a 2.4.11 failure. `outline: none` without replacement is a verified violation. |
| Focus order | 2.4.3 | Order matches visual order; modals move focus in and return it on close. |
| Names, roles, values | 4.1.2 | `browser_snapshot` (accessibility tree): buttons/links/inputs without names, `div` with click handlers and no role. |
| Labels | 1.3.1, 3.3.2 | Inputs with placeholder-only labels; labels not programmatically associated. |
| Error identification | 3.3.1, 3.3.3 | Submit invalid forms; errors in text, near the field, linked with `aria-describedby`, announced (live region) when async. |
| Headings & landmarks | 1.3.1, 2.4.6 | One `h1`, no skipped levels used for styling, `main`/`nav`/`header` landmarks. |
| Alt text | 1.1.1 | Informative images have meaningful alt; decorative images `alt=""`. |
| Target size | 2.5.8 (AA): ≥24×24 CSS px or enough spacing | Measure bounding boxes of icon buttons, table row actions, close buttons, especially at 390px. Recommend 44×44 for primary touch targets as best practice (not an AA requirement). |
| Reflow | 1.4.10 | At 320px width (or 1280px at 400% zoom) no two-dimensional scrolling except tables/maps. |
| Text spacing / resize | 1.4.4, 1.4.12 | Text resizes to 200% without loss; layouts survive increased line/letter spacing. |
| Reduced motion | 2.3.3 (AAA, best practice) | Check for `prefers-reduced-motion` handling in CSS/JS; large parallax or auto-animations without it. |
| Consistent help / redundant entry | 3.2.6, 3.3.7 (new in 2.2) | Help links in consistent places; multi-step forms don't ask for the same data twice. |
| Accessible authentication | 3.3.8 (new in 2.2) | Login doesn't block paste or password managers, no cognitive puzzles without alternatives. |
| Dragging movements | 2.5.7 (new in 2.2) | Drag-and-drop has a single-pointer alternative. |

## Automated tooling
- If the project already has axe (`@axe-core/playwright`, `jest-axe`, Storybook a11y addon), run it and include results tagged `[automated]`.
- Do not install axe without approval. You may propose it as an implementation task.
- Automated tools catch roughly a third of issues; always pair them with keyboard and snapshot checks.

## Writing accessibility acceptance criteria
Make them testable: "All text tokens on `--color-surface` meet ≥4.5:1 (contrast.mjs output attached)", "Tab order on Checkout follows visual order; focus ring 2px `--color-focus` with ≥3:1 against adjacent colors", "Icon buttons in table rows are ≥24×24px".
