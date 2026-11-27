# Integration contracts, traceability and quality gates

The ecosystem has five layers. Each hands the next one a structured, traceable package. Contracts are Markdown sections in files under `.ui-audit/` (or the project's SDD folder for Contract C/D), so a human can review every handoff.

| Layer | Role | Implemented by | Required |
|---|---|---|---|
| 1 UX/UI Audit | Orchestrator: workflow, dependencies, gates, reports, approvals, specs, validation coordination | this skill | yes |
| 2 Frontend Design | Art direction and visual design | `frontend-design` skill (official plugin) | yes for Phases 3, 5, 7a |
| 3 Playwright MCP | Real browser inspection and validation | Playwright MCP server | yes for Phases 2, 9 |
| 4 SDD / OpenSpec | Specification and implementation planning | the project's existing SDD framework, else this skill's templates | no (only for Mode B/C) |
| 5 Frontend Implementation | Execution of approved changes | Claude in Mode C, following [frontend-implementation-guidelines.md](frontend-implementation-guidelines.md#3-implementation-rules) | only in Mode C |

```
            ┌──────────── 1 UX/UI Audit (orchestrator) ────────────┐
            │                                                      │
  run plan  ▼   Contract A                         brief  ▼   Contract B
     3 Playwright MCP ──────────▶ 1 ◀────────── 2 Frontend Design
                                  │
                                  │ Contract C (approved decisions only)
                                  ▼
                        4 SDD / OpenSpec (or templates)
                                  │ Contract D
                                  ▼
                        5 Frontend Implementation (Mode C)
                                  │ Contract E
                                  ▼
                        3 Playwright MCP (validation) ──▶ 1 (validation report)
```

## 1. Stable identifiers
| Prefix | Meaning | Created in | Lives in |
|---|---|---|---|
| `AUD-###` | Audit finding | Phase 4 | `04-audit-report.md` |
| `DES-###` | Design decision of the approved direction | Phase 6 (on approval) / 7a | `05-design-directions.md` (selected section), `07-design-system-spec.md` |
| `SPEC-###` | Approved specification item (requirement) | Phase 7b | `07-implementation-spec.md` or the SDD framework's spec |
| `TASK-###` | Implementation task | Phase 7b | same as SPEC |
| `VAL-###` | Validation result | Phase 9 | `09-validation-report.md` |

Rules:
- IDs are never renumbered or reused. A dropped item keeps its ID with status `dropped` and a reason.
- Every `DES` cites the `AUD` ids it addresses (or `new` when it is a pure direction choice).
- Every `SPEC` cites at least one approved `DES`. A `SPEC` without an approved `DES` fails Gate 5.
- Every `TASK` cites its `SPEC`; every `VAL` cites its `TASK` and acceptance criterion.
- Not every finding becomes a task. Low-severity cosmetic findings may stay as `AUD` only, marked `not planned`.

### Classification of findings
Each `AUD` has:
- **Priority:** Critical (blocks a task or verified AA failure on a core flow) · High · Medium · Low
- **Kind:** `usability` (affects comprehension, task completion, errors, accessibility; backed by evidence) or `preference` (subjective visual taste). Preferences are never Critical or High.
- **Source tag:** `[automated]`, `[measured]`, `[judgment]`, `[frontend-design]`

### Traceability matrix
Kept in `.ui-audit/TRACEABILITY.md`, updated at the end of Phases 4, 6, 7b, 8 and 9:

```markdown
| AUD | Priority | Kind | DES | SPEC | TASK | Status | VAL | Result |
|---|---|---|---|---|---|---|---|---|
| AUD-001 Inconsistent button hierarchy | High | usability | DES-001 | SPEC-001 | TASK-001 | done | VAL-001 | pass |
| AUD-007 Card shadows feel heavy | Low | preference | — | — | — | not planned | — | — |
```

Task statuses: `planned` → `approved` → `in progress` → `done` → `validated` (or `regression`, `dropped`).

## 2. Contracts

### Contract A — Playwright MCP → UX/UI Audit
Producer: the orchestrator, from Playwright tool results only. File: `.ui-audit/02-browser-inspection.md` (baseline) and the "after" section in Phase 9.

| Field | Content |
|---|---|
| Application URL | base URL actually loaded (from `browser_navigate` result) |
| Routes inspected | route, screen name, auth state |
| Viewports inspected | width × height per capture |
| Screenshots generated | relative paths under `screenshots/baseline/` (or `after/`) |
| Interactions tested | scenario, steps, result (opened menu, submitted empty form…) |
| Console errors | per route: count and messages (no secrets) |
| Visual observations | short factual notes, each tied to route + viewport + screenshot |
| Inspection limitations | routes not reached, states not triggered, auth walls, flaky data |

Every observation names a screen, route or interaction. Observations are facts ("the Save button is 28px tall at 390px"), not recommendations.

### Contract B — Frontend Design → UX/UI Audit
Producer: Claude following the loaded `frontend-design` guidance, recorded under the brief in `.ui-audit/03-frontend-design-consultation.md`.

| Field | Phase 3 (critique) | Phase 5 (per direction) | Phase 7a (selected) |
|---|---|---|---|
| Design direction | personality read of the current design | concept and name | final direction |
| Visual principles | what works / what doesn't | 3–5 principles | principles applied |
| Brand personality | current | proposed | final |
| Color palette | current, issues | HEX primitives + semantic roles | final values |
| Typography | current, issues | families, scale, weights | final scale |
| Layout rules | issues | grid, density, containers | final rules |
| Component recommendations | issues | component style | per-component aesthetics |
| Design tokens | — | key tokens | full token values |
| Responsive recommendations | issues | approach | rules per breakpoint |
| Accessibility considerations | risks seen | contrast/focus/target notes | requirements |

Each item is labelled **[observed]** (verified in Contract A evidence or code) or **[recommended]** (the specialist's proposal). Recommendations never overwrite observed facts.

### Contract C — UX/UI Audit → SDD
Producer: the orchestrator in Mode B, after Gate 4. Destination: the detected SDD framework (see §4) or `.ui-audit/07-implementation-spec.md`.

| Field | Content |
|---|---|
| Approved design direction | name, adjustments, approval date and the user's words |
| Audit findings | the `AUD` ids addressed, with priority and kind |
| Proposed modifications | `DES` items |
| Affected routes | from Contract A |
| Affected components | file paths from discovery |
| Design tokens | token names and values from `07-design-system-spec.md` |
| Implementation tasks | `TASK` ids, ordered |
| Acceptance criteria | visual, responsive, accessibility; testable |
| Regression risks | shared components, snapshot tests, other routes using them |
| Validation instructions | routes × viewports × scenarios for Contract E |

Only `DES` items from the approved direction may become `SPEC`. Ideas from the other two directions are not requirements unless the user approved them as part of a hybrid.

### Contract D — SDD → Frontend Implementation
Producer: the spec (framework artifacts or template). Consumer: Claude in Mode C.

| Field | Content |
|---|---|
| Ordered tasks | `TASK` ids in dependency order (tokens → primitives → composites → screens) |
| File references | files to change, and files that must not change |
| Technical constraints | stack, token mechanism, component library, preserved behavior (logic, APIs, routes, permissions, validations, state, test ids) |
| Expected visual behavior | per task, with token references |
| Acceptance criteria | copied from Contract C, unchanged |
| Testing requirements | lint, type-check, unit/e2e commands that exist in the project |

### Contract E — Frontend Implementation → Playwright MCP
Producer: Claude in Mode C at the end of each task batch. File: `.ui-audit/02-browser-inspection.md`, section "Validation run plan".

| Field | Content |
|---|---|
| Modified routes | routes whose rendering can change |
| Modified components | components and their call sites |
| Expected visual results | per route: what should look different and what must look the same, referencing `DES`/`SPEC` |
| Viewports | the same as the baseline, plus breakpoint edges if layout changed |
| Interaction scenarios | the same as the baseline for those routes, plus states touched by the tasks |
| Regression checks | unchanged routes to spot-check, console errors, keyboard focus, contrast |

Playwright then captures `screenshots/after/` and the orchestrator compares each capture with the baseline (Contract A) and with the approved spec (Contract C). Results become `VAL` entries.

## 3. Quality gates
A gate passes only with evidence recorded in `AUDIT_STATE.md` (gate table) and, where relevant, a **succeeded** row in the tool usage log. Never mark a gate passed without evidence.

| Gate | When | Passes when | Evidence | If it fails |
|---|---|---|---|---|
| G1 Dependencies | Phase 0 | frontend-design detected; Playwright probe succeeded | `00-dependencies.md`, log rows | name blocked phases; ask before installing |
| G2 Evidence | before closing Phase 4 | a Playwright baseline run succeeded with screenshots for the planned routes × viewports | Contract A file, screenshot paths | the audit stays "incomplete"; no directions |
| G3 Art direction | before finalizing Phase 5 | frontend-design invoked with the Phase 5 brief and succeeded | Contract B section, log row | Phase 5 blocked; no directions from generic reasoning |
| G4 User approval | Phase 6 | the user chose a direction after seeing all three, in their own message | quote of the user's message, date | stay in Mode A |
| G5 Specification | end of Phase 7b | every `SPEC` traces to an approved `DES`; every `TASK` to a `SPEC`; criteria are testable | `TRACEABILITY.md` | fix the spec; do not ask for implementation |
| G6 Implementation | each task in Phase 8 | only approved `TASK` files changed; logic, APIs, routes, permissions, validations, state untouched; project checks pass | diff summary per task, check outputs | stop, revert the task's own changes if the user agrees, report |
| G7 Validation | Phase 9 | Playwright after-run succeeded for Contract E; every acceptance criterion has a `VAL` result | `09-validation-report.md`, log rows | redesign is "implemented, not validated" |

Gate table format in `AUDIT_STATE.md`:
```markdown
## Gates
| Gate | Status | Evidence | Date |
|---|---|---|---|
| G1 Dependencies | passed | 00-dependencies.md; log 14:02 | 2026-11-26 |
| G2 Evidence | pending | | |
```
Statuses: `pending`, `passed`, `failed`, `blocked`, `not applicable` (for example G5–G7 in an audit-only run).

## 4. SDD / OpenSpec integration (Layer 4)
SDD is optional. It only matters in Modes B and C; a visual audit never needs it. Never install OpenSpec or any framework, and never create a second spec system next to an existing one.

Detection (Phase 1), first match wins:

| Framework | Signals | Where Contract C goes |
|---|---|---|
| OpenSpec | `openspec/` with `specs/` and/or `changes/`; `/opsx:*` commands or OpenSpec instructions in `AGENTS.md`/`CLAUDE.md` | a change folder `openspec/changes/<change-id>/` with `proposal.md`, `design.md`, `tasks.md` and `specs/<capability>/spec.md` deltas (`## ADDED Requirements` → `### Requirement:` → `#### Scenario:`), following the project's existing changes as the format reference |
| spec-kit | `.specify/`, `specs/NNN-<feature>/spec.md`, `plan.md`, `tasks.md` | a new `specs/NNN-ui-redesign/` mirroring existing features |
| Kiro-style | `.kiro/specs/<feature>/` or `specs/<feature>/requirements.md` + `design.md` + `tasks.md` (often EARS requirements) | `<specs root>/ui-redesign-<slug>/` with the same three files, same requirement syntax |
| Other (ADRs, `docs/specs`, custom) | documented in README/CLAUDE.md/AGENTS.md | follow the documented convention; ask if unclear |
| None | — | `.ui-audit/07-implementation-spec.md` from [templates/implementation-spec.md](../templates/implementation-spec.md) |

Rules:
- Read two existing specs/changes of the framework first and copy their structure, tone and ID style. Map `SPEC`/`TASK` ids inside them (for example "SPEC-003 (AUD-002, DES-001)").
- If the project documents its own commands (for example `/opsx:propose`, `/opsx:apply`, a validate command), tell the user which ones apply. Run a framework CLI only if it is already installed and documented in the project, and only read-only or validation commands.
- Writing into the framework's folder is a project-file write: ask first (Mode B gate). Keep `.ui-audit/TRACEABILITY.md` as the cross-reference either way.
- Implementation status is tracked where the framework tracks it (checkboxes in `tasks.md`, statuses) and mirrored in `TRACEABILITY.md`.

## 5. Layer 5 — Frontend Implementation
Not a separate skill: Claude executes it in Mode C, consuming Contract D and producing Contract E. Responsibilities: apply tokens, update components, improve responsive behavior, preserve business logic, API contracts, routing and functionality, run the project's tests, then request Playwright validation (Phase 9). It never starts without Gate 4 and an explicit task approval, and it never declares itself done: completion is decided by Gate 7.
