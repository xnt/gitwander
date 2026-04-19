import { describe, it, expect } from "vitest";
import { groupFilesByDirectory, getTopHotspotDirs } from "../src/analysis/grouping.js";
import type { FileInfo } from "../src/models/types.js";

function makeFileInfo(filePath: string, commitCount: number): FileInfo {
  return {
    path: filePath,
    commitCount,
    totalAdditions: 0,
    totalDeletions: 0,
    lastModified: new Date(),
    firstSeen: new Date(),
    recentCommits: [],
  };
}

describe("groupFilesByDirectory", () => {
  it("groups files by their parent directory", () => {
    const files: FileInfo[] = [
      makeFileInfo("src/app.ts", 5),
      makeFileInfo("src/utils.ts", 3),
      makeFileInfo("tests/app.test.ts", 2),
    ];

    const groups = groupFilesByDirectory(files);
    expect(groups).toHaveLength(2);

    const srcGroup = groups.find((g) => g.directory === "src");
    expect(srcGroup).toBeDefined();
    expect(srcGroup!.files).toHaveLength(2);
  });

  it("calculates total churn per directory", () => {
    const files: FileInfo[] = [
      makeFileInfo("src/a.ts", 10),
      makeFileInfo("src/b.ts", 5),
      makeFileInfo("lib/c.ts", 3),
    ];

    const groups = groupFilesByDirectory(files);
    const srcGroup = groups.find((g) => g.directory === "src");
    expect(srcGroup!.totalChurn).toBe(15);
  });

  it("sorts groups by total churn descending", () => {
    const files: FileInfo[] = [
      makeFileInfo("low/a.ts", 1),
      makeFileInfo("high/b.ts", 20),
      makeFileInfo("mid/c.ts", 10),
    ];

    const groups = groupFilesByDirectory(files);
    expect(groups[0].directory).toBe("high");
    expect(groups[1].directory).toBe("mid");
    expect(groups[2].directory).toBe("low");
  });

  it("handles root-level files", () => {
    const files: FileInfo[] = [makeFileInfo("README.md", 2)];
    const groups = groupFilesByDirectory(files);
    expect(groups).toHaveLength(1);
    expect(groups[0].directory).toBe(".");
  });

  it("returns empty array for no files", () => {
    expect(groupFilesByDirectory([])).toEqual([]);
  });
});

describe("getTopHotspotDirs", () => {
  it("returns top N directories by churn", () => {
    const files: FileInfo[] = [
      makeFileInfo("a/x.ts", 10),
      makeFileInfo("b/x.ts", 8),
      makeFileInfo("c/x.ts", 6),
      makeFileInfo("d/x.ts", 4),
      makeFileInfo("e/x.ts", 2),
    ];

    const groups = groupFilesByDirectory(files);
    const top = getTopHotspotDirs(groups, 3);
    expect(top).toHaveLength(3);
    expect(top[0].directory).toBe("a");
    expect(top[2].directory).toBe("c");
  });
});
