# Design principles for auditing existing products

Use these as lenses, not as rules to recite. A finding must point to a concrete place in the app.

## 1. Visual hierarchy
- **One primary action per view.** Count the filled/high-emphasis buttons on a screen. More than one competing primary action is a finding unless the actions are truly equal.
- **Squint test.** Blur the screenshot mentally (or downscale it to ~25%). The first three things you notice should be the page title, the main content and the primary action. If a decorative element, sidebar or badge wins, hierarchy is broken.
- **Emphasis budget.** Size, weight, color, contrast, position and whitespace all add emphasis. Using several at once on secondary content (bold + color + uppercase labels everywhere) flattens hierarchy.
- **Heading ladder.** Visible heading sizes should form a clear step (e.g. 32 / 24 / 18 / 16). Two adjacent levels that differ by less than ~2px or only by color read as the same level.
- **Grouping (proximity).** Space inside a group must be clearly smaller than space between groups (rule of thumb: ≥1.5–2×). Labels closer to the previous field than to their own input is a classic defect.
- **Alignment.** Count distinct left edges on a screen. Each extra edge without a reason adds noise.
- **Reading flow.** In LTR interfaces, scanning follows F/Z patterns; key data at top-left of cards and tables, actions at consistent positions.

## 2. Density
- Match density to the task: dashboards/back-office tools tolerate more density than onboarding or marketing pages.
- Judge density by whether the user can find and compare information, not by "it looks crowded".
- Tables: row height 40–52px for data-heavy apps; offer a compact mode instead of shrinking everything.

## 3. Consistency
- Same thing, same look; different thing, different look. Flag both directions: a primary button styled three ways, and a link that looks like a button.
- Inventory before judging: number of distinct font sizes, colors, radii, shadows and spacing values in use (`scripts/style-inventory.js`). Typical healthy ranges: 6–9 font sizes, 1–3 radii, 2–4 shadows, a spacing set on a 4 or 8 base.

## 4. Usability heuristics (Nielsen, adapted)
1. Visibility of system status: loading, saving, success and error feedback on every async action.
2. Match with the real world: labels in the user's vocabulary, not database field names.
3. User control: cancel, undo, back, escape closes modals.
4. Consistency and standards: platform conventions for links, forms, icons.
5. Error prevention: confirmations for destructive actions, constraints instead of free text when possible.
6. Recognition over recall: visible navigation state, recent items, sensible defaults.
7. Flexibility: shortcuts and bulk actions for frequent users, without hurting novices.
8. Minimalist design: every element competes for attention; remove or demote what does not support the task.
9. Help users recover from errors: specific, polite, actionable messages next to the problem.
10. Help and documentation: empty states that teach the next step.

## 5. Cognitive load
- Count the decisions a screen asks for. Progressive disclosure for advanced options.
- Forms: one column for most forms, logical grouping, labels above fields, required/optional marked consistently.
- Avoid showing more than ~7 top-level navigation items without grouping.

## 6. Affordances and feedback
- Clickable things look clickable (cursor, hover, underline or button shape). Non-clickable things should not.
- Every interactive element has hover, focus-visible, active and disabled states that are visibly different.
- Disabled buttons should explain why when it is not obvious (helper text or tooltip).

## 7. Writing findings
Bad: "Improve spacing on the dashboard."
Good: "Dashboard KPI cards (`DashboardStats.tsx`): internal padding 12px, gap between cards 8px, so cards visually merge (screenshot `dashboard--1440--default.png`). Use 24px padding and 24px gap from the spacing scale so each KPI reads as a unit. Severity: medium. [measured]"
