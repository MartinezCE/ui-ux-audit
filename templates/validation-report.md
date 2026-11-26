# Visual Validation Report — {{Product name}}

- Date: {{YYYY-MM-DD}}
- Tasks validated: {{UI-001 … UI-00n}}
- Baseline run: `screenshots/baseline/` ({{date}})
- After run: `screenshots/after/` ({{date}})
- Playwright MCP status for this run: {{succeeded / failed / missing}} (tool usage log row: {{time}})

If the Playwright status is not **succeeded**, the result of this report is "implemented, not validated", whatever else passed.

## 1. Result
{{validated | validated with open issues | not validated}}: {{one or two sentences}}

## 2. Before / after
| Screen | Width | State | Before | After | Difference | Intended? |
|---|---|---|---|---|---|---|
| {{orders}} | 390 | default | `baseline/orders--390--default.png` | `after/orders--390--default.png` | {{what changed}} | {{yes: UI-003 / regression}} |

## 3. Acceptance criteria
| Task | Criterion | Type | Result | Evidence |
|---|---|---|---|---|
| UI-001 | {{All primary buttons use --color-primary}} | visual | {{pass / fail}} | {{screenshot, measurement}} |
| UI-001 | {{No horizontal scroll at 390px}} | responsive | | `browser_evaluate` scrollWidth |
| UI-001 | {{Text on primary ≥4.5:1}} | accessibility | | `contrast.mjs` output |

## 4. Regressions
| ID | Where | Description | Severity | Proposed fix |
|---|---|---|---|---|

## 5. Checks
- Console errors per screen: {{none / list}}
- Keyboard focus on changed components: {{pass / issues}}
- Existing tests, lint, type-check: {{commands and results}}
- Business logic, API calls, routes, validations unchanged: {{how verified: diff review, tests}}

## 6. Unresolved issues and next steps
{{list}}
