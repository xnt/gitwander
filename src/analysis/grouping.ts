import type { FileInfo, FileGroup } from "../models/types.js";
import path from "node:path";

export function groupFilesByDirectory(files: FileInfo[]): FileGroup[] {
  const groupMap = new Map<string, FileInfo[]>();

  for (const file of files) {
    const dir = path.dirname(file.path);
    const existing = groupMap.get(dir);
    if (existing) {
      existing.push(file);
    } else {
      groupMap.set(dir, [file]);
    }
  }

  const groups: FileGroup[] = [];
  for (const [directory, dirFiles] of groupMap) {
    const totalChurn = dirFiles.reduce((sum, f) => sum + f.commitCount, 0);
    groups.push({ directory, files: dirFiles, totalChurn });
  }

  groups.sort((a, b) => b.totalChurn - a.totalChurn);
  return groups;
}

export function getTopHotspotDirs(groups: FileGroup[], limit: number = 5): FileGroup[] {
  return groups.slice(0, limit);
}
