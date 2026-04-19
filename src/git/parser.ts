import type { Commit, FileChange } from "../models/types.js";

const DELIMITER = "---GITWANDER-COMMIT---";

export function parseGitLog(raw: string): Commit[] {
  const commits: Commit[] = [];
  const blocks = raw.split(DELIMITER).filter((b) => b.trim().length > 0);

  for (const block of blocks) {
    const commit = parseCommitBlock(block);
    if (commit) {
      commits.push(commit);
    }
  }

  return commits;
}

function parseCommitBlock(block: string): Commit | null {
  const lines = block.split("\n").filter((l) => l.length > 0);
  if (lines.length < 4) return null;

  const hash = lines[0].trim();
  const shortHash = lines[1].trim();
  const author = lines[2].trim();
  const date = new Date(lines[3].trim());
  const message = lines[4]?.trim() ?? "";

  const files: FileChange[] = [];
  for (let i = 5; i < lines.length; i++) {
    const file = parseNumstatLine(lines[i]);
    if (file) {
      files.push(file);
    }
  }

  return { hash, shortHash, author, date, message, files };
}

function parseNumstatLine(line: string): FileChange | null {
  const match = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
  if (!match) return null;

  const additions = match[1] === "-" ? 0 : parseInt(match[1], 10);
  const deletions = match[2] === "-" ? 0 : parseInt(match[2], 10);
  const path = match[3];

  return { path, additions, deletions };
}
