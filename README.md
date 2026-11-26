# ui-ux-audit

**A Claude Code skill that audits, art-directs and redesigns the UI/UX of existing web applications.**

[Leer en español](README.es.md) · License: [CC BY-NC 4.0](LICENSE) (free for non-commercial use)

`ui-ux-audit` turns Claude Code into a senior product designer and design-systems engineer for a project you already have. It reads your source code, drives the running app with [Playwright MCP](https://github.com/microsoft/playwright-mcp), scores ten quality dimensions, proposes three clearly different design directions, and turns the one you approve into a design-system spec and small, SDD-ready implementation tasks.

It does not touch your code unless you explicitly approve it, and it checks the result with before/after screenshots.

## Architecture
Five layers with separate responsibilities. `ui-ux-audit` is the orchestrator; it never does a specialist's job and hands each layer a structured, traceable package.

```
            ┌──────────── 1 UI/UX Audit (orchestrator) ────────────┐
  run plan  ▼   Contract A                         brief  ▼   Contract B
     3 Playwright MCP ──────────▶ 1 ◀────────── 2 Frontend Design
                                  │ Contract C (approved decisions only)
                                  ▼
                        4 SDD / OpenSpec (or the built-in templates)
                                  │ Contract D
                                  ▼
                        5 Frontend Implementation (Mode C)
                                  │ Contract E
                                  ▼
                        3 Playwright MCP (validation) ──▶ 1 (validation report)
```

| Layer | Responsibility | Implemented by | Required |
|---|---|---|---|
| 1 UI/UX Audit | Workflow, dependencies, quality gates, approvals, reports, specs, validation coordination | this skill (`/ui-ux-audit`) | Yes |
| 2 Frontend Design | Art direction, visual identity, typography, color, layout, component aesthetics, design system | `frontend-design` skill, official plugin | Yes |
| 3 Playwright MCP | Navigation, routes, interaction, screenshots, responsive checks, before/after validation | Playwright MCP tools `mcp__<server>__browser_*` | Yes |
| 4 SDD / OpenSpec | Approved decisions turned into specs, tasks, acceptance criteria, status tracking | your project's framework if it has one, otherwise the skill's templates | Only for specification and implementation |
| 5 Frontend Implementation | Applying approved tasks while preserving logic, APIs and routes | Claude in Mode C | Only with your approval |

Rules the orchestrator follows:
- Every run starts by verifying the specialists (Gate G1) and shows their status: missing, detected, succeeded, failed.
- Detection is not invocation, and invocation is not success. A report only says a specialist was used when the tool usage log has a successful call, and a gate is only marked passed with evidence.
- If a specialist is missing, the phases that depend on it are reported as blocked. The skill does not fill the gap with generic reasoning and does not install anything without asking. It never installs OpenSpec.

### Traceability
Every relevant finding can be followed through its lifecycle with stable ids:

`AUD-001` inconsistent button hierarchy → `DES-001` standardize primary and secondary buttons → `SPEC-001` button tokens and variants → `TASK-001` update the shared Button component → `VAL-001` visual consistency verified on the affected routes.

Findings are prioritized (Critical, High, Medium, Low) and classified as `usability` or `preference`; preferences are never Critical or High, and not every cosmetic observation has to become a task. The matrix lives in `.ui-audit/TRACEABILITY.md`.

The five contracts (A–E), the id rules and the gates are documented in [references/integration-contracts.md](references/integration-contracts.md).

## Table of contents
1. [What you get](#what-you-get)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [frontend-design setup](#frontend-design-setup)
5. [Playwright MCP setup](#playwright-mcp-setup)
6. [Quick start](#quick-start)
7. [Usage](#usage)
8. [Workflow and approval gates](#workflow-and-approval-gates)
9. [Operating modes](#operating-modes)
10. [Outputs](#outputs)
11. [SDD integration](#sdd-integration)
12. [Helper scripts](#helper-scripts)
13. [Safety](#safety)
14. [Limitations](#limitations)
15. [Repository structure](#repository-structure)
16. [Updating and uninstalling](#updating-and-uninstalling)
17. [Contributing](#contributing)
18. [License](#license)

---

## What you get
| Capability | Details |
|---|---|
| Project discovery | Framework, routing, styling, component library, tokens, themes, breakpoints, icons, duplicated or inconsistent UI patterns, a do-not-touch list |
| Live visual inspection | Real screens at 1440 / 1280 / 768 / 390 px, plus hover, focus, menus, modals, empty, loading and error states |
| Visual and UX audit | Hierarchy, typography, color, layout, components, interaction, UX heuristics. Every finding is concrete: where, evidence, why it matters, how to fix it |
| Accessibility audit | WCAG 2.2 AA checks, with verified violations kept apart from potential issues. No compliance claims from screenshots |
| Scoring | Ten dimensions scored 0–10, each with reasoning, evidence, main issues and improvements, and marked as mostly measured or mostly judgment |
| Art direction | Three distinct directions: conservative refinement, modernization, full rebrand. Each has HEX palettes (contrast-checked), typography, components, navigation, layout and real-screen examples |
| Design system | Semantic tokens and component guidelines in your project's own token format |
| Implementation spec | Small tasks with visual, responsive and accessibility acceptance criteria, regression risks and validation steps |
| Implementation | Only after approval. Presentation only; logic, APIs, routes, permissions and validations stay as they are |
| Validation | Before/after screenshots at the same widths, console checks, your existing tests |

## Requirements
| Dependency | Required | Why | How to get it |
|---|---|---|---|
| [Claude Code](https://code.claude.com/docs) | yes | Runs the skill | See the official docs |
| Node.js 18+ | yes | Playwright MCP through `npx`, the helper scripts and the source-edit guard | [nodejs.org](https://nodejs.org) |
| Git | to install from this repo | Clone and update | [git-scm.com](https://git-scm.com) |
| Playwright MCP (`@playwright/mcp`, Microsoft) | **yes** | Navigate the app, resize, screenshots, accessibility tree, console, before/after validation | [Setup below](#playwright-mcp-setup) |
| `frontend-design` plugin (Anthropic) | **yes** | Art direction, visual identity, typography, color, design-system aesthetics | [Setup below](#frontend-design-setup) |
| axe-core in your project | optional | Automated accessibility results, if already present | The skill never installs it without asking |

Without Playwright MCP the skill can only run discovery; the browser audit, the directions and the validation are blocked. Without frontend-design it can audit, but the art direction phases are blocked. In both cases it tells you what is missing and the command to install it.

## Installation
Claude Code looks for skills in `~/.claude/skills/<name>/SKILL.md` (personal, every project) and in `<repo>/.claude/skills/<name>/SKILL.md` (one project, shared through git). The root of this repository is the skill folder, so you can clone it straight into place.

### Personal install (recommended)
macOS / Linux:
```bash
git clone https://github.com/MartinezCE/ui-ux-audit.git ~/.claude/skills/ui-ux-audit
```

Windows (PowerShell):
```powershell
git clone https://github.com/MartinezCE/ui-ux-audit.git "$env:USERPROFILE\.claude\skills\ui-ux-audit"
```

### Project install
From the root of the project you want to audit:
```bash
git clone https://github.com/MartinezCE/ui-ux-audit.git .claude/skills/ui-ux-audit
rm -rf .claude/skills/ui-ux-audit/.git   # optional: commit the skill as plain files in your repo
```
Or add it as a submodule if you prefer to track updates:
```bash
git submodule add https://github.com/MartinezCE/ui-ux-audit.git .claude/skills/ui-ux-audit
```

### Without git
Download the ZIP from **Code → Download ZIP**, extract it, rename the folder to `ui-ux-audit` and move it to one of the locations above.

### Check that it loaded
Start `claude` and type `/`. You should see `ui-ux-audit` in the list. Skills are detected live; if it does not show up, restart the session.

> **claude.ai or the Skills API:** the frontmatter uses two fields that only Claude Code understands (`when_to_use`, `argument-hint`). Delete those two lines from `SKILL.md` before uploading it elsewhere, because other surfaces reject unknown keys.

## frontend-design setup
Anthropic's official plugin, from the `claude-plugins-official` marketplace:
```bash
claude plugin install frontend-design@claude-plugins-official
```
Or inside a session: `/plugin install frontend-design@claude-plugins-official`. Then run `/reload-plugins` (or start a new session) and check that `/frontend-design:frontend-design` appears when you type `/`. `claude plugin list` also shows it with its status.

frontend-design is an instruction skill: when the orchestrator invokes it, its design guidance is loaded into the conversation and the design work is produced following it. The orchestrator saves the brief and that output in `.ui-audit/03-frontend-design-consultation.md`.

## Playwright MCP setup
Use Microsoft's official server: [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp). Install it **one** way, either as a standalone MCP server or as the official plugin that bundles the same server; the skill detects either and never adds a second one.

As a plugin:
```bash
claude plugin install playwright@claude-plugins-official
```

As a standalone server:

```bash
# Available in all your projects
claude mcp add --scope user playwright -- npx @playwright/mcp@latest --isolated

# Or shared with a single repo through .mcp.json
claude mcp add --scope project playwright -- npx @playwright/mcp@latest --isolated
```

If Chromium is not installed yet:
```bash
npx playwright install chromium
```

Check the connection inside Claude Code with `/mcp`; `playwright` should show as connected.

Useful flags (everything after `--` goes to the server, not to Claude Code):

| Flag | Use |
|---|---|
| `--isolated` | Keeps the browser profile in memory so no cookies survive the session. Recommended for audits |
| `--viewport-size 1440x900` | Initial window size. The skill resizes to each audit width anyway |
| `--headless` | No visible window, useful for unattended runs |
| `--storage-state ./auth.json` | Starts logged in with a test account session you saved yourself. Keep that file out of git |
| `--output-dir ./.ui-audit/playwright` | Where the server writes its own files |

Playwright MCP is not a security boundary, as its own docs point out. Point it only at local or test environments you trust.

## Quick start
```bash
cd path/to/your-frontend
npm run dev          # or let the skill find the command and ask you before starting it
claude
```
Then, inside Claude Code:
```text
/ui-ux-audit audit
```
After the audit, ask for the directions, pick one, and continue step by step (see [Usage](#usage)).

## Usage
The first argument chooses how far the skill goes; anything after it is free text.

| Command | What happens |
|---|---|
| `/ui-ux-audit` | Resumes from the saved state and runs until the next approval gate |
| `/ui-ux-audit audit` | Discovery and audit only, then stops |
| `/ui-ux-audit directions` | Proposes the three design directions (reuses an existing audit) and waits for your choice |
| `/ui-ux-audit design-system` | Builds the design system for the direction you chose |
| `/ui-ux-audit spec` | Writes the implementation tasks |
| `/ui-ux-audit implement <tasks>` | Implements the tasks you approve, then validates |
| `/ui-ux-audit validate` | Re-captures screens and compares them with the baseline |

Examples:
```text
/ui-ux-audit audit Audit the current application without modifying source code.
/ui-ux-audit directions Inspect the application and propose three complete rebranding directions.
/ui-ux-audit design-system Use direction 2, but with the typography of direction 3.
/ui-ux-audit implement Implement the approved visual direction using the generated specifications, tasks TASK-001 to TASK-004.
```

Claude can also load the skill on its own when you ask something like "review the UX of this app" or "this dashboard looks dated, propose a redesign". In that case it also runs in audit-only mode.

## Workflow and approval gates
| Phase | What happens | Layer | Mode | Gate |
|---|---|---|---|---|
| 0 Dependency verification | Detects and probes the specialists, checks the source-edit guard, reports blocked phases | 1 (+2, 3 probe) | any | G1 Dependencies |
| 1 Project discovery | Framework, routing, components, styling, tokens, libraries, assets, conventions, SDD framework | 1 | A | |
| 2 Real browser inspection | Routes × 1440/1280/768/390 px × states, screenshots, snapshots, console, style inventories (Contract A) | 3 | A | |
| 3 Frontend Design consultation | Critique of the current design (Contract B) | 2 | A | |
| 4 Combined audit report | `AUD` findings with priority and kind, scores, accessibility, responsive | 1 | A | G2 Evidence |
| 5 Three design directions | Conservative refinement, modernization, full rebrand, checked by the orchestrator | 2 | A | G3 Art direction |
| 6 ⛔ Approval | You choose a direction; it becomes `DES` decisions | 1 | A | G4 User approval |
| 7 Design system and specification | Tokens, component specs, `SPEC` and `TASK` items with acceptance criteria (Contracts C, D) | 2 + 4 | B | G5 Specification |
| 8 ⛔ Approved implementation | Only the `TASK` ids you name | 5 | C | G6 Implementation |
| 9 Visual validation | Same routes, widths and states, before/after comparison, `VAL` results (Contract E) | 3 | C | G7 Validation |

The skill stops and waits for you:
- before starting a dev server or any other process
- after presenting the three directions, until you choose one
- before writing into your project's spec folders
- before implementing anything, and only for the tasks you name

Approval is never generated automatically: asking for "audit and implement everything" in the first message passes no gate. Progress, gates and the tool usage log are saved in `.ui-audit/AUDIT_STATE.md`, so you can close the session and continue later.

## Operating modes
| Mode | What it does | What it may write |
|---|---|---|
| **A, Audit** (default) | Reads code, browses the app, takes screenshots, reviews the design, writes the audit report and the three directions | `.ui-audit/` only |
| **B, Specification** | Turns the approved direction into a design system, SDD artifacts and an implementation plan | `.ui-audit/` and the SDD folders you approve |
| **C, Implementation** | Implements the tasks you approved, runs your tests, validates with Playwright, reports regressions | the files of the approved tasks |

Modes never change on their own. Mode B starts when you pick a direction and ask for the spec; Mode C only when you name the `TASK` ids to implement. In Mode C the skill reads the affected files and explains the plan before each change, reuses existing components and keeps business logic, API contracts, routes, permissions, workflows, validations, state management, analytics events and test ids untouched. After validation it goes back to Mode B.

## Outputs
Everything goes into `.ui-audit/` at the root of the audited project:

```
.ui-audit/
├── AUDIT_STATE.md                      phase, mode, direction, approved tasks, tool usage log
├── 00-dependencies.md                  specialist status and blocked phases
├── 01-discovery.md                     stack, routes, tokens, components, do-not-touch list
├── 02-browser-inspection.md            Playwright run plan and results
├── 03-frontend-design-consultation.md  briefs sent to frontend-design and its output
├── 04-audit-report.md                  scores, findings, accessibility, responsive table
├── 05-design-directions.md             three directions with palettes, type and examples
├── 07-design-system-spec.md            tokens and component guidelines
├── 07-implementation-spec.md           SPEC and TASK items (or your SDD framework's files)
├── TRACEABILITY.md                     AUD → DES → SPEC → TASK → VAL matrix
├── 09-validation-report.md             before/after comparison and acceptance results
├── guard.log                           decisions of the source-edit guard
├── screenshots/
│   ├── baseline/               <screen>--<width>--<state>.png
│   └── after/
├── evidence/                   style inventories (JSON)
└── mockups/                    optional static HTML mockups
```

The skill asks before adding `.ui-audit/` to your `.gitignore`.

## SDD integration
SDD is optional and never needed for a visual audit. In Mode B the skill detects the framework your project already uses and writes in its format; it never installs one and never creates a second spec system.

| Framework | Detected by | Output |
|---|---|---|
| OpenSpec | `openspec/` with `specs/` or `changes/` | a change in `openspec/changes/<change-id>/` (`proposal.md`, `design.md`, `tasks.md`, spec deltas), following your existing changes |
| spec-kit | `.specify/`, `specs/NNN-<feature>/` | a new `specs/NNN-ui-redesign/` mirroring your features |
| Kiro-style specs | `.kiro/specs/` or `specs/<feature>/requirements.md`, `design.md`, `tasks.md` | `ui-redesign-<slug>/` with the same three files and requirement syntax |
| Other (ADRs, `docs/specs`) | documented in README, CLAUDE.md or AGENTS.md | the documented convention |
| None | | `.ui-audit/07-implementation-spec.md` |

Writing into your spec folders counts as a project change, so the skill asks first and the guard only allows the folders you approved. `.ui-audit/TRACEABILITY.md` keeps the AUD → VAL cross-reference either way.

## Helper scripts
All scripts have no dependencies.

**`scripts/contrast.mjs`** computes exact WCAG contrast ratios.
```bash
node scripts/contrast.mjs "#6b7280" "#ffffff"
node scripts/contrast.mjs "#666/#fff" "rgba(0,0,0,0.6)/#ffffff"
node scripts/contrast.mjs --json pairs.json
node scripts/contrast.mjs --inventory .ui-audit/evidence/dashboard-styles.json
```
It exits with code 1 when any pair fails AA, so you can use it in CI.

**`scripts/style-inventory.js`** is a function you pass to Playwright MCP's `browser_evaluate`. It returns the fonts, sizes, colors, radii, shadows and spacing really used on the page, text/background pairs for contrast checks, interactive elements smaller than 24×24 px, horizontal overflow, the heading outline and images without `alt`.

**`scripts/guard-source-edits.mjs`** is a `PreToolUse` hook declared in `SKILL.md`. It blocks Edit, Write and NotebookEdit outside the paths of the current mode: `.ui-audit/` in Mode A, plus the approved SDD folders in Mode B, the approved task files in Mode C. Every decision is logged to `.ui-audit/guard.log`. When the audit is over, ask it to set `Mode: off` (skill hooks stay registered for the rest of the session).

## Safety
- Credentials, API keys, tokens and cookies are never shown in chat or saved in artifacts.
- Source code and screenshots are never sent to external services without your permission.
- No installs, process starts or writes outside `.ui-audit/` without your approval.
- No backend, database schema or API contract changes during a visual redesign.
- Authentication is never bypassed; it asks for a test account or uses a session you provide.
- Screenshots are checked for personal data before they are saved.

## Limitations
- Scores are expert assessments, not measurements. Each one says what it rests on.
- Accessibility results do not claim WCAG conformance; screen-reader behavior and cognitive aspects need manual testing.
- Screens behind login, feature flags or specific data states are covered only if you give access or test data.
- Fine pixel differences are better caught with Playwright's `toHaveScreenshot` than by looking at images.
- Canvas/WebGL-heavy interfaces, native mobile apps and email templates are out of scope.
- Fonts and assets suggested in the directions still need a license check.
- The source-edit guard covers Claude's file-editing tools, not shell commands; Bash writes in audit mode are prevented by the instructions only. The hook command uses `${CLAUDE_SKILL_DIR}`; if your shell does not resolve it (for example PowerShell without Git Bash), the hook fails open and Phase 0 reports the guard as missing.
- The full workflow was smoke-tested against `@playwright/mcp` 0.0.68 and the official frontend-design 1.1.1 sources, not against every version.
- Long audits use a lot of context. Reports go to files and chat replies stay short; resume any time with `/ui-ux-audit`.

## Repository structure
```
ui-ux-audit/
├── SKILL.md                     entry point: workflow, gates, modes, safety
├── README.md / README.es.md
├── LICENSE                      CC BY-NC 4.0
├── references/
│   ├── design-principles.md
│   ├── accessibility-guidelines.md
│   ├── design-system-guidelines.md
│   ├── responsive-guidelines.md
│   ├── visual-audit-checklist.md
│   ├── branding-guidelines.md
│   ├── frontend-implementation-guidelines.md
│   ├── orchestration.md         specialist detection, invocation, briefs, tool usage log
│   └── integration-contracts.md layers, contracts A–E, ids, traceability, gates, SDD detection
├── templates/
│   ├── audit-report.md
│   ├── design-proposal.md
│   ├── design-system-spec.md
│   ├── implementation-spec.md
│   └── validation-report.md
└── scripts/
    ├── contrast.mjs
    ├── style-inventory.js
    └── guard-source-edits.mjs   PreToolUse hook: write limits per mode
```
`SKILL.md` stays short on purpose. Claude reads the references and templates only when a phase needs them.

## Updating and uninstalling
```bash
# update
git -C ~/.claude/skills/ui-ux-audit pull

# uninstall
rm -rf ~/.claude/skills/ui-ux-audit
```
On Windows use `"$env:USERPROFILE\.claude\skills\ui-ux-audit"` as the path, and `Remove-Item -Recurse -Force` to uninstall.

## Contributing
Issues and pull requests are welcome. By contributing you agree that your contribution is licensed under the same CC BY-NC 4.0 terms. Useful contributions:
- detection rules for more stacks, component libraries or SDD frameworks
- sharper checklists or WCAG checks
- real audit examples (with permission and without personal data)

Keep `SKILL.md` under 500 lines and put detail in `references/`.

## License
© 2026 Cristian Martinez. Licensed under [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](LICENSE).

You can:
- use the skill for free on your own projects, your studies or open source work
- copy, modify and share it, including adapted versions

As long as you:
- credit the author and link to this repository and the license
- say whether you changed anything
- do not use it for commercial purposes: for example selling it, bundling it into a paid product or service, or offering paid audits based on it

For commercial use, open an issue or contact the author to ask for permission.

Note: because it restricts commercial use, this license is "source-available" rather than open source in the OSI sense.
