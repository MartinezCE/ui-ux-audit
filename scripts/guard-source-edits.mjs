#!/usr/bin/env node
// PreToolUse guard for the ui-ux-audit skill. Zero dependencies.
//
// Registered by SKILL.md frontmatter for Edit|MultiEdit|Write|NotebookEdit.
// Enforces the write limits of the skill's modes for Claude's file-editing tools.
//
// Decision table (project = $CLAUDE_PROJECT_DIR or the hook input's cwd):
//   no .ui-audit/AUDIT_STATE.md in project            -> allow (no audit in progress)
//   target inside <project>/.ui-audit/                 -> allow
//   Mode: A (audit)                                    -> deny
//   Mode: B (specification), target inside an approved
//           path listed in "- SDD paths: a, b"         -> allow, otherwise deny
//   Mode: C (implementation)                           -> allow (task scope is enforced by the skill's instructions)
//   Mode: off (audit finished)                         -> allow
//   missing or unreadable mode                         -> treated as Mode A
// Denials exit 2 with a reason on stderr.
//
// Every decision is appended to .ui-audit/guard.log so Phase 0 can confirm the guard is active.
// It never reads file contents and never touches anything outside .ui-audit/guard.log.

import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';

const norm = (p) => {
  const r = path.resolve(p);
  return process.platform === 'win32' ? r.toLowerCase() : r;
};
const inside = (child, parent) => {
  const rel = path.relative(norm(parent), norm(child));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0); // malformed input: do not interfere
}

const tool = input.tool_name || '';
const target = input.tool_input?.file_path || input.tool_input?.notebook_path;
if (!target) process.exit(0);

const project = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const auditDir = path.join(project, '.ui-audit');
const stateFile = path.join(auditDir, 'AUDIT_STATE.md');
const abs = path.isAbsolute(target) ? target : path.join(input.cwd || project, target);

const log = (decision, why) => {
  try {
    if (existsSync(auditDir)) {
      appendFileSync(path.join(auditDir, 'guard.log'),
        `${new Date().toISOString()}\t${decision}\t${tool}\t${path.relative(project, abs)}\t${why}\n`);
    }
  } catch { /* logging must never break the session */ }
};

if (!existsSync(stateFile)) process.exit(0);

if (inside(abs, auditDir)) {
  log('allow', 'inside .ui-audit');
  process.exit(0);
}

let mode = 'A';
let sddPaths = [];
try {
  const state = readFileSync(stateFile, 'utf8');
  const m = state.match(/^\s*-\s*Mode:\s*(A|B|C|off)\b/im);
  if (m) mode = m[1].toUpperCase() === 'OFF' ? 'off' : m[1].toUpperCase();
  const p = state.match(/^\s*-\s*SDD paths:\s*(.+)$/im);
  if (p && !/^\(?none\)?$/i.test(p[1].trim())) {
    sddPaths = p[1].split(',').map((x) => x.trim().replace(/^`|`$/g, '')).filter(Boolean)
      .map((x) => path.resolve(project, x))
      .filter((x) => inside(x, project) && !inside(project, x)); // only real subfolders of the project
  }
} catch { /* unreadable state: treat as Mode A */ }

if (mode === 'C' || mode === 'off') {
  log('allow', `Mode ${mode}`);
  process.exit(0);
}
if (mode === 'B' && sddPaths.some((d) => inside(abs, d))) {
  log('allow', 'Mode B, approved SDD path');
  process.exit(0);
}

const why = mode === 'B'
  ? 'Mode B (specification): only .ui-audit/ and the approved SDD paths may be written'
  : 'Mode A (audit): only .ui-audit/ may be written';
log('deny', why);
process.stderr.write(
  `ui-ux-audit guard: blocked ${tool} on ${path.relative(project, abs)}. ${why}. ` +
  `Source changes need Mode C, which requires the user's explicit approval of specific TASK ids. ` +
  `If the audit is finished, the user can ask to set "Mode: off" in .ui-audit/AUDIT_STATE.md.\n`
);
process.exit(2);
