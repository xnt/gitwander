# GitWander

Interactive TUI for exploring Git repository history. Navigate commits and files, spot churn hotspots, and understand your repo's evolution — all from the terminal.

## Install

```bash
npm install
npm run build
```

## Usage

```bash
# Run in the current repo
node dist/index.js

# Run against a specific repo path
node dist/index.js /path/to/repo
```

## Keyboard shortcuts

| Key       | Action             |
|-----------|--------------------|
| `j` / `↓` | Move down          |
| `k` / `↑` | Move up            |
| `Tab`     | Switch mode (Trail/Terrain) |
| `Enter`   | Focus detail pane  |
| `b`       | Go back to list    |
| `q`       | Quit               |

## Modes

- **Trail** — Browse commits chronologically. See author, date, message, and changed files.
- **Terrain** — Browse files by churn. See commit frequency, change volume, and recent history.

## Tests

```bash
npm test
```

## Docker

```bash
docker build -t gitwander .
docker run -it -v /path/to/repo:/repo gitwander /repo
```
