# Visual Validation Report — {{Product name}}

- Date: {{YYYY-MM-DD}}
- Tasks validated: {{TASK-001 … TASK-00n}}
- Contract E (validation plan): `02-browser-inspection.md` § Validation run plan
- Baseline run: `screenshots/baseline/` ({{date}})
- After run: `screenshots/after/` ({{date}})
- Playwright MCP status for this run: {{succeeded / failed / missing}} (tool usage log row: {{time}})

If the Playwright status is not **succeeded**, the result of this report is "implemented, not validated", whatever else passed.

## 1. Result
{{validated | validated with open issues | not validated}}: {{one or two sentences}}

## 2. Before / after
| Screen | Width | State | Before | After | Difference | Intended? |
|---|---|---|---|---|---|---|
| {{orders}} | 390 | default | `baseline/orders--390--default.png` | `after/orders--390--default.png` | {{what changed}} | {{yes: TASK-003 / regression}} |

## 3. Acceptance criteria
| VAL | Task | Criterion | Type | Result | Evidence |
|---|---|---|---|---|---|
| VAL-001 | TASK-001 | {{All primary buttons use --color-primary}} | visual | {{pass / fail}} | {{screenshot, measurement}} |
| VAL-002 | TASK-001 | {{No horizontal scroll at 390px}} | responsive | | `browser_evaluate` scrollWidth |
| VAL-003 | TASK-001 | {{Text on primary ≥4.5:1}} | accessibility | | `contrast.mjs` output |

## 4. Regressions
| ID | Where | Description | Severity | Proposed fix |
|---|---|---|---|---|

## 5. Checks
- Console errors per screen: {{none / list}}
- Keyboard focus on changed components: {{pass / issues}}
- Existing tests, lint, type-check: {{commands and results}}
- Business logic, API calls, routes, validations unchanged: {{how verified: diff review, tests}}

## 6. Gate G7
- Status: {{passed / failed / blocked}}
- Evidence: after-run log row {{time}}, {{N}} captures, all criteria have a VAL result: {{yes/no}}

## 7. Unresolved issues and next steps
{{list}}
