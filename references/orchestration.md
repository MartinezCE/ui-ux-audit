# Orchestration: specialists, dependency checks and handoffs

`ui-ux-audit` is the orchestrator. It owns the workflow, the gates, the reports and the specs. It delegates two jobs it must not do on its own:

| Capability | Responsibility | Required | Mechanism |
|---|---|---|---|
| `ui-ux-audit` | Workflow orchestration, discovery, evidence synthesis, reports, gates, SDD specs, implementation coordination | Yes | This skill |
| `frontend-design` | How the product should look and feel: art direction, identity, typography, color, composition, component aesthetics, hierarchy, interaction design, design-system aesthetics | Yes | Skill tool |
| Playwright MCP | How the product actually renders and behaves: navigation, routes, interaction, viewports, screenshots, evidence, before/after validation | Yes | MCP tool calls |

## 1. Status vocabulary
Use exactly these words in `00-dependencies.md`, `AUDIT_STATE.md` and every report:

- **missing**: not found in this session
- **detected**: found in the session's skill list or tool list, not called yet
- **invoked**: called, result not yet confirmed
- **succeeded**: called and returned a valid result (keep the evidence)
- **failed**: called and returned an error (quote the error)
- **blocked**: a phase could not run because a required capability is missing or failed

Detection is not invocation. Invocation is not success. Never write that a specialist was used unless its status is **succeeded** and the evidence is recorded in the tool usage log.

## 2. Phase 0: dependency verification procedure

### 2.1 frontend-design
1. Look at the skills available in this session (the skill list Claude Code provides). Accept these names, in this order:
   - `frontend-design:frontend-design`: the official plugin `frontend-design@claude-plugins-official`
   - `frontend-design`: the same skill installed standalone in `~/.claude/skills/` or `.claude/skills/`
   - another `<plugin>:frontend-design` only if the user confirms it is the one to use
2. Optional confirmation from the shell, read-only: `claude plugin list` (shows version, scope and status of installed plugins).
3. Record **detected** with the exact name, or **missing**.

### 2.2 Playwright MCP
1. Look for MCP tools whose names end in `__browser_navigate` and `__browser_take_screenshot`. The prefix depends on how it was installed, so never hardcode it:
   - standalone server named `playwright`: `mcp__playwright__browser_navigate`
   - official plugin `playwright@claude-plugins-official`: `mcp__plugin_playwright_playwright__browser_navigate`
   - any other server name `<x>`: `mcp__<x>__browser_navigate`
   If MCP tools are deferred behind tool search, search for `browser_navigate` first.
2. If several Playwright servers exist, use one and say which. Do not add another.
3. Optional read-only shell check: `claude mcp list` (shows `✔ Connected`, `✘ Failed to connect`, etc.).
4. Probe: call `<prefix>browser_tabs` with `{ "action": "list" }`. A tab list (even `about:blank`) means **succeeded**. An error means **failed**: quote it (common causes: browser not installed → `npx playwright install chromium`; server not connected → `/mcp`).

### 2.3 Source-edit guard
This skill registers a `PreToolUse` hook (`scripts/guard-source-edits.mjs`) that enforces the write limits of the current mode for Edit/Write/NotebookEdit (Mode A: only `.ui-audit/`; Mode B: plus the approved `SDD paths`; Mode C: approved task files). See [integration-contracts.md §3](integration-contracts.md#3-quality-gates) for how modes relate to gates. Writing `00-dependencies.md` triggers it. Then read `.ui-audit/guard.log`:
- a new `allow` line for `00-dependencies.md` → guard **succeeded**
- no line → guard **missing** (hook not registered or not runnable). Say so; audit-only mode then relies on instructions alone.

### 2.4 Report
Write `.ui-audit/00-dependencies.md` and show the table in chat:

```markdown
| Capability | Status | Name / tool prefix | Evidence or error |
|---|---|---|---|
| ui-ux-audit | succeeded | ui-ux-audit (${CLAUDE_SKILL_DIR}) | running |
| frontend-design | detected | frontend-design:frontend-design | listed in session skills |
| Playwright MCP | succeeded | mcp__playwright__ | browser_tabs list → 1 tab |
| Source-edit guard | succeeded | PreToolUse hook | guard.log allow 00-dependencies.md |
```

### 2.5 Missing or failing dependencies
Report them explicitly and say which phases are blocked. Never install or reconfigure without explicit permission. With permission, these are the official commands:

```bash
# frontend-design (official Anthropic plugin)
claude plugin install frontend-design@claude-plugins-official
#   then /reload-plugins in the open session (or restart). Inside a session the user can also run:
#   /plugin install frontend-design@claude-plugins-official
#   If the marketplace is not registered yet:
#   claude plugin marketplace add anthropics/claude-plugins-official

# Playwright MCP (Microsoft), either the standalone server...
claude mcp add --scope user playwright -- npx @playwright/mcp@latest --isolated
# ...or the official plugin that bundles the same server
claude plugin install playwright@claude-plugins-official
# Browser binaries if missing
npx playwright install chromium
```

A newly added MCP server or plugin usually needs `/reload-plugins` or a new session before its tools appear. After installing, run Phase 0 again.

| Missing | Blocked phases | What may still run |
|---|---|---|
| frontend-design | 3, 5 and the aesthetic part of 7 | 0, 1, 2, 4 (report marked "Frontend Design consultation: blocked") |
| Playwright MCP | 2, 4, 5, 9 | 0, 1. A code-only review only if the user explicitly asks for it, titled "Preliminary code review, not a UI audit" |
| both | 2–5, 7 (aesthetics), 9 | 0, 1 |

## 3. Invoking frontend-design
Mechanism: the **Skill tool** with the exact name recorded in Phase 0, passing the brief as `args`. The user can trigger the same skill by typing `/frontend-design:frontend-design <brief>`.

What happens: frontend-design is an instruction skill. Invoking it loads Anthropic's design guidance into the conversation; it does not return a separate document. Its output is the design work produced in the same turn while following that guidance. So:
1. Write the brief to `.ui-audit/03-frontend-design-consultation.md` (or append a new section for phases 5 and 7).
2. Invoke the skill with the brief.
3. Status **succeeded** only if the tool call returned the skill content without error. Then produce the requested design output, explicitly following the loaded guidance, and save it under the brief as "Frontend Design output".
4. If the call errors: status **failed**, quote the error, the phase is **blocked**. Do not write design directions from generic reasoning instead.

The orchestrator keeps its own constraints over the specialist's taste: existing functionality, evidenced brand constraints, WCAG contrast, the project's stack and component library.

### Brief template (frontend-design)
```markdown
## Frontend Design brief — Phase {{3 | 5 | 7}}
Task: {{3: critique the current visual design | 5: develop three differentiated directions (conservative refinement, modernization, full rebrand) | 7: define the design-system aesthetics for the approved direction}}
Product: {{what it is, who uses it, main jobs}}
Stack constraints: {{framework, styling, component library, token mechanism}}
Existing brand identity (evidenced only): {{logo colors, mandated fonts, docs}} — anything else is open
Current design characteristics: {{fonts, palette, radii, density, icon set; from style inventories}}
Screenshots (paths): {{3–6 most representative, desktop + mobile}}
Audit findings to address: {{top AUD ids with priority, kind and one line each}}
Hard constraints: keep IA, routes and functionality; WCAG 2.2 AA; reuse existing component library
Selected direction (phase 7 only): {{name + adjustments}}
Expected output: {{3: strengths, weaknesses, personality read | 5: per direction: concept, personality, palette HEX, typography, layout, component style, navigation, pros, cons, complexity | 7: token values and component aesthetics}}
```

Pass screenshots as file paths in the brief and look at them (Read) before writing the output, so the design work is grounded in what the app really looks like.

## 4. Invoking Playwright MCP
Mechanism: direct MCP tool calls, `<prefix>browser_*`. Verified against `@playwright/mcp` 0.0.68.

| Purpose | Tool | Arguments |
|---|---|---|
| Probe | `browser_tabs` | `{ "action": "list" }` |
| Open a route | `browser_navigate` | `{ "url": "http://localhost:3000/orders" }` |
| Viewport | `browser_resize` | `{ "width": 390, "height": 844 }` |
| Settle | `browser_wait_for` | `{ "text": "Orders" }` or `{ "time": 1 }` |
| Screenshot | `browser_take_screenshot` | `{ "filename": ".ui-audit/screenshots/baseline/orders--390--default.png", "fullPage": true }` |
| Structure, accessible names | `browser_snapshot` | `{}` |
| Console | `browser_console_messages` | `{}` |
| Interaction | `browser_click`, `browser_hover`, `browser_type`, `browser_press_key`, `browser_fill_form`, `browser_select_option` | element `ref` from the latest snapshot |
| Style inventory | `browser_evaluate` | `{ "function": "<contents of scripts/style-inventory.js>" }` |

Rules:
- **Create the screenshot folders first** (`.ui-audit/screenshots/baseline/`, `.ui-audit/screenshots/after/`). `browser_take_screenshot` fails with ENOENT if the folder does not exist. Relative filenames resolve against the MCP server's working directory, normally the project root; if a file lands elsewhere, use an absolute path inside `.ui-audit/`.
- Never call `browser_run_code` or `browser_run_code_unsafe` (arbitrary code in the server process).
- Only `http://localhost`, `127.0.0.1` or test URLs the user gave you.
- A step counts as done only when the tool returned without error and the expected file exists.

### Brief template (Playwright run plan)
Write it to `.ui-audit/02-browser-inspection.md` before running, then fill in results:
```markdown
## Browser run plan — {{baseline | after}}
Base URL: {{http://localhost:5173}}
Auth: {{none | test account given by user | storage state file}}
Viewports: 1440x900, 1280x800, 768x1024, 390x844 {{+ breakpoint edges}}
Routes: {{/ , /login, /dashboard, /orders, /orders/:id (id=…), /settings}}
Scenarios per route: {{default; open menu; open modal; submit empty form; empty list; error}}
Screenshot naming: <screen>--<width>--<state>.png
Validation criteria (after run only): {{acceptance criteria ids from the implementation spec}}

## Results
| Route | Width | State | Screenshot | Console errors | Notes |
|---|---|---|---|---|---|
```

## 5. Tool usage log
`AUDIT_STATE.md` keeps an append-only log. One row per specialist call that matters (probes, consultations, capture batches, validation runs):

```markdown
## Tool usage log
| When | Phase | Capability | Call | Status | Evidence |
|---|---|---|---|---|---|
| 2026-11-26 14:02 | 0 | Playwright MCP | browser_tabs list | succeeded | 1 tab |
| 2026-11-26 14:20 | 2 | Playwright MCP | 48 screenshots, 12 snapshots | succeeded | screenshots/baseline/ |
| 2026-11-26 14:41 | 3 | frontend-design | Skill frontend-design:frontend-design | succeeded | 03-frontend-design-consultation.md |
```

Reports cite this log. A report may only say "inspected in the browser" or "reviewed with Frontend Design" if a **succeeded** row backs it.

## 6. Avoiding duplicated work
- Playwright captures each screen/width/state once per run; later phases reuse the files.
- frontend-design gets the findings and screenshots instead of re-auditing; the orchestrator does not redo the specialist's aesthetic analysis, it merges and checks it (contrast, constraints, feasibility).
- When resuming, read `AUDIT_STATE.md` and skip specialist calls that already **succeeded** for the current inputs.
