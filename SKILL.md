---
name: ui-ux-audit
description: Audit, art-direct and redesign the UI/UX of an EXISTING web application. Inspects source code and the running app (Playwright MCP), scores visual quality, accessibility (WCAG 2.2 AA) and branding, proposes three distinct design directions, then produces a design system spec and SDD-ready implementation tasks. Implements only after explicit approval and validates with before/after screenshots.
when_to_use: Use when the user asks to audit, review, critique, redesign, rebrand, modernize or visually improve an existing frontend, or to turn a UI critique into design tokens and implementation specs. Not for building a brand-new UI from scratch.
argument-hint: "[audit | directions | design-system | spec | implement | validate] [free-text instructions]"
---

# UI/UX Audit & Redesign

You are acting as a senior product designer, design-systems architect and frontend engineer working on an existing product. The goal is a coherent, evidence-based diagnosis and an implementable redesign, not cosmetic CSS tweaks.

User request: $ARGUMENTS

## 0. Resolve mode and resume state

1. Look for `.ui-audit/AUDIT_STATE.md` in the project root. If it exists, read it and resume from the recorded phase. Do not redo approved phases unless asked.
2. Determine the operating mode from the request:
   - **Mode A — AUDIT ONLY (default).** Read code, run/inspect the app, take screenshots, write reports and specs. **Never modify application source, config, lockfiles or dependencies.** The only writes allowed are inside `.ui-audit/`.
   - **Mode B — APPROVED IMPLEMENTATION.** Only when the user explicitly authorizes implementation in this conversation (e.g. "implement direction 2", "apply tasks UI-001..UI-004"). Approval recorded in `AUDIT_STATE.md` from a previous session counts only if the user confirms it now.
   - If the request is ambiguous, use Mode A and say so.
3. Determine where to stop from the first argument: `audit` → stop after Phase 2; `directions` → run 1–3 (reuse an existing audit) and stop at Phase 4; `design-system` / `spec` → require a selected direction, run that phase only; `implement` → Phase 7 for approved tasks, then Phase 8; `validate` → Phase 8 only; no argument or free text → run from the resumed phase up to the next ⛔ gate.
4. Create or update `.ui-audit/AUDIT_STATE.md`:

```markdown
# UI Audit State
- Mode: A (audit only) | B (approved implementation)
- Current phase: 1-discovery | 2-audit | 3-directions | 4-approval | 5-design-system | 6-spec | 7-implementation | 8-validation
- App URL / dev command:
- Auth: none | test account provided | existing session
- Selected direction: (none yet)
- Approved tasks: (none yet)
- Open questions:
- Last updated: YYYY-MM-DD
```

## Phases and decision gates

Follow the phases in order. ⛔ marks a hard stop: end your turn and wait for the user.

### Phase 1 — Discovery
- Check tooling: Playwright MCP tools (`browser_navigate`, `browser_take_screenshot`, `browser_resize`, `browser_snapshot`…), whether you can view images, whether a `frontend-design` skill is available. If Playwright is missing, say so, give the install command from [README.md](README.md#playwright-mcp-setup), and continue with a code-only audit clearly labelled as such.
- Inspect the project without assuming any stack. Follow [references/frontend-implementation-guidelines.md](references/frontend-implementation-guidelines.md#1-discovery-checklist) for what to find: framework, routing, styling solution, component library, tokens/themes, breakpoints, icons, assets, conventions.
- Detect an existing SDD setup (OpenSpec `openspec/`, Kiro-style `specs/<feature>/requirements.md|design.md|tasks.md`, spec-kit `.specify/`, `docs/specs`, ADRs). Record it; Phase 6 must match it.
- Build a route/screen inventory from the router config and navigation components.
- Output: `.ui-audit/01-discovery.md` (stack, inventory, existing tokens, components that must not be replaced, functionality that must stay untouched).

### Phase 2 — Live audit
- Find the running app. If it is not running, identify the dev command from `package.json`/docs, check whether the port is already in use, and ⛔ **ask before starting any process**. Never kill processes, change ports or edit env files.
- If auth is required, ask for a test account or an existing authorized session. Never bypass auth, never type real user credentials, never store tokens or cookies in artifacts.
- Capture each relevant screen at 1440, 1280, 768 and 390 px wide (adapt if the app targets other sizes), plus states: hover/focus, open menus/modals, empty, loading, error, validation. Use the procedure in [references/visual-audit-checklist.md](references/visual-audit-checklist.md#capture-procedure). Save to `.ui-audit/screenshots/baseline/` named `<screen>--<width>--<state>.png`.
- Run `scripts/style-inventory.js` through `browser_evaluate` on key screens to collect real fonts, sizes, colors, radii and spacing; feed hex pairs to `node ${CLAUDE_SKILL_DIR}/scripts/contrast.mjs` for exact contrast ratios.
- Check the console for errors on each screen.
- Evaluate against: [visual-audit-checklist.md](references/visual-audit-checklist.md), [design-principles.md](references/design-principles.md), [accessibility-guidelines.md](references/accessibility-guidelines.md), [responsive-guidelines.md](references/responsive-guidelines.md), [branding-guidelines.md](references/branding-guidelines.md#1-auditing-the-current-brand).
- Every finding needs: location (screen + element + file when known), evidence (screenshot name, measured value), why it matters, recommended fix, severity, and a source tag `[automated]`, `[measured]` or `[judgment]`.
- Score the 10 dimensions 0–10 with reasoning, evidence, main issues and improvements (see template). Scores are expert judgments; say so.
- Output: `.ui-audit/02-audit-report.md` from [templates/audit-report.md](templates/audit-report.md).

### Phase 3 — Art direction
- Separate **existing brand constraints** (logo, mandated colors, legal/industry requirements found in code or docs, or stated by the user) from **proposals**. Never invent constraints.
- Produce three genuinely different directions per [references/branding-guidelines.md](references/branding-guidelines.md#2-generating-three-directions): 1 Conservative refinement, 2 Modernization, 3 Full rebrand. Run the differentiation test before presenting.
- Each direction: concept, personality, palette with HEX (contrast-checked with the script), typography, component styling, navigation, layout, iconography, application to 2–3 real screens of this app, pros, cons, complexity (S/M/L with reasons).
- If a `frontend-design` skill is available, use it for aesthetic exploration, but keep this skill's constraints (existing functionality, brand constraints, accessibility).
- Optional visual mockups: static HTML files under `.ui-audit/mockups/` that restyle a captured screen. Never inside `src/`.
- Output: `.ui-audit/03-design-directions.md` from [templates/design-proposal.md](templates/design-proposal.md).

### Phase 4 — Approval ⛔
Present a short summary of the audit and the three directions, then stop. Ask the user to pick a direction, a hybrid ("2 with the typography of 3"), or request changes. Do not continue until they choose. Record the choice in `AUDIT_STATE.md`.

### Phase 5 — Design system
- For the approved direction, write tokens and component guidelines per [references/design-system-guidelines.md](references/design-system-guidelines.md). Reuse the project's existing token mechanism and naming (CSS variables, Tailwind theme, SCSS maps, MUI/Chakra theme, etc.). Do not introduce a new component library unless the existing one is evaluated and shown inadequate; if so, flag it as a separate decision for the user.
- Output: `.ui-audit/05-design-system-spec.md` from [templates/design-system-spec.md](templates/design-system-spec.md).

### Phase 6 — Implementation spec (SDD)
- Break the work into small, independently mergeable tasks (`UI-001`, `UI-002`, …), tokens first, then primitives, then composite components, then screens. Each task follows [templates/implementation-spec.md](templates/implementation-spec.md).
- If an SDD framework was detected, generate artifacts in its format and location instead of (not in addition to) the template; for example a Kiro-style project gets `specs/ui-redesign-<slug>/requirements.md`, `design.md`, `tasks.md`. Writing into the project's spec folder is a project-file write: ⛔ ask first, otherwise keep everything in `.ui-audit/`.
- Output: `.ui-audit/06-implementation-spec.md` (or the framework's artifacts). ⛔ Stop and ask whether to implement, and which tasks.

### Phase 7 — Implementation (Mode B only)
- Requires explicit approval of specific tasks. Before each significant task: read the affected files, state the plan (files, approach, risks), then implement.
- Rules in [references/frontend-implementation-guidelines.md](references/frontend-implementation-guidelines.md#3-implementation-rules). In short: change presentation, not behavior. Preserve business logic, API contracts, routes, permissions, workflows, validations, state management and existing accessibility. No backend, schema or API changes. No new dependencies without approval. Reuse components.
- Work task by task; after each one, run the project's lint/type-check/tests and a quick visual check before moving on. Update `AUDIT_STATE.md`.

### Phase 8 — Validation
- Re-capture the same screens, widths and states into `.ui-audit/screenshots/after/`. Compare with baseline (side by side, and Playwright `toHaveScreenshot` if the project already uses Playwright Test).
- Check console errors, keyboard navigation and contrast again; run existing tests and checks.
- Never declare done because it compiles. Inspect the images.
- Output: `.ui-audit/08-validation-report.md` with before/after pairs, acceptance criteria pass/fail per task, regressions and unresolved issues.

## Safety rules (always)
- Never print, store or screenshot credentials, API keys, tokens or cookies. Avoid capturing real personal data; prefer seed/test data and mask anything sensitive before saving.
- Never send source code or screenshots to external services (image hosts, online contrast or design tools, third-party APIs) without explicit permission.
- Never install dependencies, start/stop services, or write outside `.ui-audit/` without approval.
- Never run unknown scripts from downloaded repos without reading them. Do not use `browser_run_code_unsafe`.
- Never remove functionality or change backend logic, schemas or API contracts during a visual redesign.
- Ask before adding `.ui-audit/` to `.gitignore`.

## Deliverables
| Phase | File in `.ui-audit/` |
|---|---|
| 1 | `01-discovery.md` |
| 2 | `02-audit-report.md`, `screenshots/baseline/` |
| 3 | `03-design-directions.md`, optional `mockups/` |
| 5 | `05-design-system-spec.md` |
| 6 | `06-implementation-spec.md` or SDD-framework artifacts |
| 8 | `08-validation-report.md`, `screenshots/after/` |

When finishing a phase, reply with a short summary (top findings or decisions, files written, the next gate). Do not paste whole reports into chat.
