# UI/UX Audit Report — {{Product name}}

- Date: {{YYYY-MM-DD}}
- Mode: Audit only
- Environment audited: {{URL / commit / branch}}
- Auth: {{none / test account / existing session}}
- Tooling: {{Playwright MCP yes/no, image analysis yes/no, axe yes/no}}

## 1. Scope
| Screen | Route | Widths captured | States captured | Notes |
|---|---|---|---|---|
| {{Dashboard}} | {{/dashboard}} | 1440, 1280, 768, 390 | default, menu-open, empty | |

**Not covered:** {{screens/flows not reachable and why}}

## 2. Executive summary
{{3–6 sentences: overall quality, the three most important problems, the biggest opportunity.}}

## 3. Scores
Scores are expert assessments (0–10), not objective measurements. Source column: M = mostly measured, J = mostly judgment.

| Dimension | Score | Source | One-line reason |
|---|---|---|---|
| Visual consistency | | | |
| Typography | | | |
| Color system | | | |
| Layout | | | |
| Component quality | | | |
| UX | | | |
| Responsive design | | | |
| Accessibility | | | |
| Branding coherence | | | |
| Overall visual quality | | | |

### Score details
For each dimension:
#### {{Dimension}} — {{score}}/10
- Reasoning:
- Evidence: {{screenshots, measurements, files}}
- Main issues: {{F-ids}}
- Recommended improvements:

## 4. Current-state inventory
- Fonts: {{families, sizes found (count), weights}}
- Colors: {{distinct text colors, backgrounds, borders; framework defaults?}}
- Spacing values: {{count, base?}}
- Radii / shadows: {{values}}
- Components: {{library + custom; duplicated implementations with paths}}
- Existing tokens: {{mechanism, coverage %, hardcoded values count}}
- Brand constraints found: {{only evidenced ones}}

## 5. Findings
Sorted by severity. Tags: [automated] tool output · [measured] computed by you · [judgment] expert opinion.

### F-001 {{Title}} — {{Critical/High/Medium/Low}} — {{tag}}
- Where:
- Evidence:
- Why it matters:
- Recommendation:

## 6. Accessibility
### Verified violations
| ID | WCAG SC | Where | Evidence | Fix |
|---|---|---|---|---|

### Potential issues (need manual / AT testing)
| ID | WCAG SC | Where | Why suspected | How to verify |
|---|---|---|---|---|

### Not tested
{{list}}

Statement: No claim of WCAG conformance is made. Results apply only to the tested scope.

## 7. Responsive behavior
| Screen | 1440 | 1280 | 768 | 390 | Notes |
|---|---|---|---|---|---|

## 8. Console and technical observations
{{errors/warnings per screen, font loading, layout shift, unused CSS of note}}

## 9. Strengths to keep
{{what works and must survive any redesign}}

## 10. Next step
Phase 3: art direction (three directions). If this run was invoked with `audit`, it stops here until the user asks for directions.
