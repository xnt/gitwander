import type { Commit, FileInfo } from "../models/types.js";

export function buildFileInfos(commits: Commit[]): FileInfo[] {
  const fileMap = new Map<string, {
    commitCount: number;
    totalAdditions: number;
    totalDeletions: number;
    lastModified: Date;
    firstSeen: Date;
    recentCommits: Commit[];
  }>();

  for (const commit of commits) {
    for (const file of commit.files) {
      const existing = fileMap.get(file.path);
      if (existing) {
        existing.commitCount++;
        existing.totalAdditions += file.additions;
        existing.totalDeletions += file.deletions;
        if (commit.date > existing.lastModified) {
          existing.lastModified = commit.date;
        }
        if (commit.date < existing.firstSeen) {
          existing.firstSeen = commit.date;
        }
        if (existing.recentCommits.length < 10) {
          existing.recentCommits.push(commit);
        }
      } else {
        fileMap.set(file.path, {
          commitCount: 1,
          totalAdditions: file.additions,
          totalDeletions: file.deletions,
          lastModified: commit.date,
          firstSeen: commit.date,
          recentCommits: [commit],
        });
      }
    }
  }

  const files: FileInfo[] = [];
  for (const [path, info] of fileMap) {
    files.push({ path, ...info });
  }

  files.sort((a, b) => b.commitCount - a.commitCount);
  return files;
}

export function getChurnLabel(file: FileInfo): string {
  if (file.commitCount >= 20) return "hotspot";
  if (file.commitCount >= 10) return "active";
  if (file.commitCount >= 5) return "moderate";
  return "stable";
}
