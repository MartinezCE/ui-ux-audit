#!/usr/bin/env node
// PreToolUse guard for the ui-ux-audit skill. Zero dependencies.
//
// Registered by SKILL.md frontmatter for Edit|MultiEdit|Write|NotebookEdit.
// Blocks file edits outside <project>/.ui-audit/ while the audit is in Mode A (audit only).
//
// Decision table (project = $CLAUDE_PROJECT_DIR or the hook input's cwd):
//   no .ui-audit/AUDIT_STATE.md in project  -> allow (no audit in progress)
//   target inside <project>/.ui-audit/       -> allow
//   Mode: B (approved implementation)        -> allow (task scope is enforced by the skill's instructions)
//   Mode: off (audit finished/paused)        -> allow
//   anything else (Mode: A or unreadable)    -> deny, exit 2 with a reason on stderr
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
try {
  const m = readFileSync(stateFile, 'utf8').match(/^\s*-\s*Mode:\s*(A|B|off)\b/im);
  if (m) mode = m[1].toUpperCase() === 'OFF' ? 'off' : m[1].toUpperCase();
} catch { /* unreadable state: treat as audit-only */ }

if (mode === 'B' || mode === 'off') {
  log('allow', `Mode ${mode}`);
  process.exit(0);
}

log('deny', 'Mode A (audit only)');
process.stderr.write(
  `ui-ux-audit guard: blocked ${tool} on ${path.relative(project, abs)}. ` +
  `The audit is in Mode A (audit only), so only files inside .ui-audit/ may be written. ` +
  `Implementation needs the user's explicit approval of specific tasks (Mode B). ` +
  `If the audit is finished, the user can ask to set "Mode: off" in .ui-audit/AUDIT_STATE.md.\n`
);
process.exit(2);
