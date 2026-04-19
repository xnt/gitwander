import { execSync } from "node:child_process";

const COMMIT_LIMIT = 500;
const DELIMITER = "---GITWANDER-COMMIT---";

const LOG_FORMAT = [
  DELIMITER,
  "%H",   // full hash
  "%h",   // short hash
  "%an",  // author name
  "%aI",  // author date ISO
  "%s",   // subject
].join("%n");

export function readGitLog(repoPath: string, limit: number = COMMIT_LIMIT): string {
  return execSync(
    `git log --numstat --format="${LOG_FORMAT}" -n ${limit}`,
    { cwd: repoPath, encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 },
  );
}

export function getRepoRoot(repoPath: string): string {
  return execSync("git rev-parse --show-toplevel", {
    cwd: repoPath,
    encoding: "utf-8",
  }).trim();
}

export function isGitRepo(repoPath: string): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      cwd: repoPath,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}
