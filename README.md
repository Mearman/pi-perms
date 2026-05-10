# pi-perms

[![npm version](https://img.shields.io/npm/v/pi-perms.svg)](https://www.npmjs.com/package/pi-perms)
[![License](https://img.shields.io/badge/License-Apache--2.0-lightgrey.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://img.shields.io/github/actions/workflow/status/Mearman/pi-perms/ci.yml?branch=main)](https://github.com/Mearman/pi-perms/actions)

Pi CLI extension that enforces a cross-agent permission policy from `.agents/permissions.json`.

Uses [agent-perms](https://www.npmjs.com/package/agent-perms) for evaluation and policy loading. See the [agent-perms README](https://github.com/Mearman/agent-permissions#readme) for the full schema, rule syntax, and codec documentation.

## Install

```bash
pnpm add pi-perms
```

Pi loads the extension automatically via the `pi.extensions` field in `package.json` — no additional configuration needed.

## How it works

1. Subscribes to `tool_call` events from Pi
2. Loads the merged permission policy from `.agents/permissions.json` + `.agents/permissions.local.json`
3. Evaluates the tool call against the policy (deny-first)
4. Blocks denied calls, passes `ask` calls through Pi's default confirmation, and allows everything else

## Policy file

Create `.agents/permissions.json` in your project root:

```json
{
  "permissions": {
    "allow": ["Bash(git status)", "Bash(npm run test:*)", "Read", "Grep"],
    "deny": ["Bash(sudo:*)", "Bash(rm -rf /)"],
    "ask": ["Bash(git push:*)", "Bash(npm publish:*)"]
  }
}
```

| File | Purpose | Git |
|---|---|---|
| `.agents/permissions.json` | Team-shared policy | Committed |
| `.agents/permissions.local.json` | Personal overrides | Gitignored |

## Rule syntax

Rules use `Tool(pattern)` strings compatible with Claude Code:

| Pattern | Matches |
|---|---|
| `Read` | All file reads |
| `Bash(git status)` | Exactly `git status` |
| `Bash(npm:*)` | Commands starting with `npm ` |
| `Bash(git commit *)` | `git commit` followed by anything |
| `Bash(domain:evil.com)` | Commands containing `evil.com` |

Evaluation order: **deny → ask → allow**. Deny short-circuits before all other tiers.

## Dependencies

- [agent-perms](https://www.npmjs.com/package/agent-perms) — evaluator, loader, Zod schemas
- [@earendil-works/pi-coding-agent](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) — Pi extension API (peer dependency, ≥0.74)

## Development

```bash
pnpm install
pnpm test             # 20 tests (unit + e2e)
pnpm typecheck
pnpm lint
```

### Source structure

```
src/
  extension.ts        # Pi extension factory — subscribes to tool_call events
  test/
    e2e.test.ts       # End-to-end tests with mock ExtensionAPI
    evaluate.test.ts  # Unit tests for extractInput()
```

The evaluator and loader live in `agent-perms` — pi-perms is a thin wiring layer that connects them to Pi's extension API.

## License

Apache-2.0
