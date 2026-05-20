# AGENTS.md

## Cursor Cloud specific instructions

### Overview

GitWander is a terminal-based TUI (built with React/Ink) for exploring Git repository history. It also includes a `starboard` CLI for generating test repositories. Single-package Node.js repo — no external services needed.

### Prerequisites

- Node.js 22+ and npm (system-provided)
- Git CLI on `$PATH`
- `git config --global init.defaultBranch main` must be set (tests create temporary repos and expect `main` as the default branch)

### Key Commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Build | `npm run build` |
| Dev (watch) | `npm run dev` |
| Run app | `node dist/index.js [path-to-repo]` |
| Run all tests | `npm test` |
| Run core tests | `npx vitest run tests/churn.test.ts tests/parser.test.ts tests/grouping.test.ts tests/app-state.test.ts` |
| Run starboard tests | `npx vitest run tests/starboard/ --testTimeout=60000` |

### Gotchas

- **Starboard tests require extended timeouts in Cloud VMs**: The `tests/starboard/` tests create many git commits in temp directories and are slow under constrained I/O. Use `--testTimeout=60000` when running them. The core tests (`churn`, `parser`, `grouping`, `app-state`) run in <1s.
- **Vitest worker IPC timeouts**: When running all starboard tests together, vitest may report `Timeout calling "onTaskUpdate"` errors. These are vitest IPC timeouts from heavy I/O, not actual test failures. Running test files individually avoids this.
- **Build before run**: The app runs from `dist/` which is gitignored. Always build first (`npm run build`) or use `npm run dev` for watch mode.
- **TUI requires a terminal**: The app uses Ink (React for terminals). In Cloud Agent environments, launch it inside a tmux session to provide a TTY.
