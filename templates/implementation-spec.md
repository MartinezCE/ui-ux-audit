# Implementation Specification — {{Product name}} UI redesign

- Direction: {{name}}
- Design system: `07-design-system-spec.md`
- SDD framework detected: {{none / OpenSpec / Kiro-style specs / spec-kit / other}} → {{if one was detected, Contracts C and D are written in its format instead of this file; keep only the cross-reference in `TRACEABILITY.md`}}
- Approved direction: {{name}} (Gate G4, {{date}})
- Gate G5: {{pending / passed: every SPEC traces to an approved DES, every TASK to a SPEC}}

## Specifications
| SPEC | Requirement | From DES | Affected routes | Affected components | Tokens |
|---|---|---|---|---|---|
| SPEC-001 | {{Define button tokens and component variants}} | DES-001 | {{/orders, /settings}} | {{src/components/Button.tsx}} | {{--color-primary…}} |

## Guardrails (apply to every task)
- Presentation only: no changes to business logic, API contracts, routes, permissions, validations, state management, analytics events or test ids.
- No new dependencies unless listed in the task and approved.
- Each task is independently mergeable and reversible.
- Implementation happens only in Mode C, for TASK ids the user approved by name.

## Order
1. Tokens and theme foundation
2. Primitives (Button, Input, …)
3. Composite components (Table, Modal, Navigation…)
4. Screen-level layout fixes
5. Visual regression baseline/update

## Task list
| TASK | Title | SPEC | Depends on | Size | Status |
|---|---|---|---|---|---|
| TASK-001 | {{Update the shared Button component}} | SPEC-001 | — | S | planned |

---

### TASK-001 — {{Title}}
- **Implements:** SPEC-001 (DES-001; AUD-001)
- **Description:**
- **Problem solved:** {{AUD ids and one line}}
- **Affected screens:**
- **Affected components:**
- **Relevant files:** {{paths, when known}}
- **Expected behavior:** {{what changes visually; what must not change}}
- **Visual acceptance criteria:**
  - [ ] {{e.g. All primary buttons use `--color-primary`, height 40px (md), radius `--radius-md`}}
- **Responsive acceptance criteria:**
  - [ ] {{e.g. At 390px, no horizontal page scroll on /orders}}
- **Accessibility acceptance criteria:**
  - [ ] {{e.g. Text on primary ≥4.5:1; focus ring visible with ≥3:1}}
- **Regression risks:** {{where else the component is used; snapshot tests that will change}}
- **Validation steps:**
  1. Run {{lint / type-check / tests}}
  2. Capture {{screens}} at 1440/1280/768/390 into `screenshots/after/`
  3. Compare with baseline; confirm criteria
  4. Check console for errors
- **Dependencies to install:** {{none}}
