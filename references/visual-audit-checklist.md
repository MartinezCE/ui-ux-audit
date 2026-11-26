# Visual audit checklist

## Capture procedure
All browser work goes through Playwright MCP. Tool names below are short forms: call them with the prefix found in Phase 0 (for example `mcp__playwright__browser_navigate`). Exact arguments: [orchestration.md §4](orchestration.md#4-invoking-playwright-mcp).

0. Make sure `.ui-audit/screenshots/baseline/` (or `after/`) and `.ui-audit/evidence/` exist; screenshots fail if the folder is missing.
1. Confirm the base URL with the user (never guess production URLs; audit local or test environments).
2. Build the screen list from routes + navigation. Prioritize: entry/auth, main dashboard/home, the 3–5 most used workflows, a form-heavy screen, a table/list screen, settings, error/404.
3. For each screen and each viewport (see responsive-guidelines.md):
   - `browser_resize` → `browser_navigate` → `browser_wait_for` (content or ~1s settle).
   - `browser_take_screenshot` full page, filename `.ui-audit/screenshots/baseline/<screen>--<width>--default.png`.
   - `browser_snapshot` once per screen (desktop) for structure and accessible names.
   - `browser_console_messages` once per screen; record errors/warnings.
4. States (desktop + mobile at least): hover and focus on primary controls, open dropdown/menu, open modal, form validation errors (submit empty), empty list, loading (throttle or catch during navigation), error state if reachable without breaking anything. Only trigger states that are safe: never submit real orders, payments, deletions or emails. Use cancel paths, test data or ask.
5. Run `scripts/style-inventory.js` via `browser_evaluate` on 3–5 representative screens. Save output as `.ui-audit/evidence/<screen>-styles.json`.
6. Record every capture in the results table of `02-browser-inspection.md` and one summary row in the tool usage log.
7. Before saving any screenshot, check it for personal data, tokens or secrets; if present, ask the user or use test data. Never save screenshots of password managers or credential fields with values.

Do not assume the homepage represents the app.

## Per-screen checklist

### Hierarchy
- [ ] Page title clear and dominant
- [ ] One primary action; secondary actions visually subordinate
- [ ] Content grouped; spacing inside groups < between groups
- [ ] Number of left alignment edges reasonable
- [ ] Information density fits the task

### Typography
- [ ] Families in use (count; >2 families without reason is a finding)
- [ ] Sizes in use vs a coherent scale
- [ ] Weights loaded vs used (unused font files = performance finding)
- [ ] Body line height 1.4–1.6; headings 1.1–1.3
- [ ] Line length 45–80ch for reading text
- [ ] Numeric data uses tabular figures where compared in columns

### Color
- [ ] Primary/secondary/accent identifiable and used consistently
- [ ] Semantic colors consistent (same red for every error)
- [ ] Text and UI contrast measured (contrast.mjs)
- [ ] Number of distinct grays (often 10+ → consolidate)
- [ ] Dark/light theme parity, if applicable

### Layout
- [ ] Spacing values on a scale (4/8 base)
- [ ] Grid/container widths consistent across screens
- [ ] Component proportions (button heights match input heights)
- [ ] Behavior at each viewport

### Components
Check each present: buttons, inputs, selects, dropdowns, tables, cards, navigation, modals, tooltips, notifications, badges.
- [ ] Number of visual variants vs intended variants
- [ ] All states designed: hover, focus-visible, active, disabled, loading, error
- [ ] Same component looks the same across screens (note file paths of divergent implementations)

### Interaction & feedback
- [ ] Hover/focus visible and distinct
- [ ] Loading feedback for async actions
- [ ] Error messages specific and placed near the cause
- [ ] Success confirmation after saves
- [ ] Destructive actions confirmed
- [ ] Keyboard access to all functions

### UX
- [ ] User knows where they are (nav state, breadcrumbs, titles)
- [ ] Main tasks discoverable within 1–2 interactions
- [ ] Labels in user vocabulary
- [ ] Empty states guide the next step
- [ ] Consistent patterns for the same task across screens

## Finding format
```
### AUD-012 Inconsistent primary buttons — Priority: High — Kind: usability — [measured]
Where: Orders (`OrdersPage.tsx`), Settings (`SettingsForm.vue`), Login
Evidence: orders--1440--default.png, settings--1440--default.png; heights 36/40/44px, radii 4/6/9999px, three blues (#2563eb, #1d4ed8, #3b82f6)
Why it matters: users rely on consistent visual cues to find the main action; three styles dilute brand and slow recognition.
Recommendation: single Button primitive with size tokens (32/40/48) and `--color-primary`; migrate the three call sites.
```

Each finding also gets a **kind**: `usability` (evidence that it hurts comprehension, task completion, error recovery or accessibility) or `preference` (subjective taste). Preferences are never Critical or High. IDs and lifecycle: [integration-contracts.md §1](integration-contracts.md#1-stable-identifiers).

Priority scale: **Critical** (blocks a task or a verified AA failure on a core flow), **High** (frequent friction or inconsistency on core screens), **Medium** (noticeable, workaround exists), **Low** (polish).

## Scoring guidance (0–10)
- 9–10: exemplary, would hold up against best-in-class products in its category
- 7–8: solid with minor inconsistencies
- 5–6: functional but visibly inconsistent or dated; several medium issues
- 3–4: frequent problems affecting comprehension or trust
- 0–2: severely broken

Use whole numbers. Justify each with evidence and name the main issues. Mark whether the score rests mostly on measurements or on judgment.
