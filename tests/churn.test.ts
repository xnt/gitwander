import { describe, it, expect } from "vitest";
import { buildFileInfos, getChurnLabel } from "../src/analysis/churn.js";
import type { Commit, FileInfo } from "../src/models/types.js";

function makeCommit(hash: string, files: { path: string; add: number; del: number }[], date?: Date): Commit {
  return {
    hash,
    shortHash: hash.slice(0, 7),
    author: "Test Author",
    date: date ?? new Date("2024-01-01"),
    message: `Commit ${hash}`,
    files: files.map((f) => ({ path: f.path, additions: f.add, deletions: f.del })),
  };
}

describe("buildFileInfos", () => {
  it("aggregates file changes across commits", () => {
    const commits: Commit[] = [
      makeCommit("aaa", [{ path: "a.ts", add: 10, del: 2 }]),
      makeCommit("bbb", [{ path: "a.ts", add: 5, del: 1 }, { path: "b.ts", add: 3, del: 0 }]),
      makeCommit("ccc", [{ path: "a.ts", add: 1, del: 1 }]),
    ];

    const files = buildFileInfos(commits);
    expect(files).toHaveLength(2);

    const fileA = files.find((f) => f.path === "a.ts")!;
    expect(fileA.commitCount).toBe(3);
    expect(fileA.totalAdditions).toBe(16);
    expect(fileA.totalDeletions).toBe(4);
  });

  it("sorts files by commit count descending", () => {
    const commits: Commit[] = [
      makeCommit("aaa", [{ path: "rare.ts", add: 1, del: 0 }]),
      makeCommit("bbb", [{ path: "frequent.ts", add: 1, del: 0 }]),
      makeCommit("ccc", [{ path: "frequent.ts", add: 1, del: 0 }]),
      makeCommit("ddd", [{ path: "frequent.ts", add: 1, del: 0 }]),
    ];

    const files = buildFileInfos(commits);
    expect(files[0].path).toBe("frequent.ts");
    expect(files[1].path).toBe("rare.ts");
  });

  it("tracks date ranges correctly", () => {
    const commits: Commit[] = [
      makeCommit("aaa", [{ path: "x.ts", add: 1, del: 0 }], new Date("2024-03-01")),
      makeCommit("bbb", [{ path: "x.ts", add: 1, del: 0 }], new Date("2024-01-15")),
      makeCommit("ccc", [{ path: "x.ts", add: 1, del: 0 }], new Date("2024-06-20")),
    ];

    const files = buildFileInfos(commits);
    const x = files[0];
    expect(x.lastModified).toEqual(new Date("2024-06-20"));
    expect(x.firstSeen).toEqual(new Date("2024-01-15"));
  });

  it("returns empty array for no commits", () => {
    expect(buildFileInfos([])).toEqual([]);
  });
});

describe("getChurnLabel", () => {
  const makeFileInfo = (commitCount: number): FileInfo => ({
    path: "test.ts",
    commitCount,
    totalAdditions: 0,
    totalDeletions: 0,
    lastModified: new Date(),
    firstSeen: new Date(),
    recentCommits: [],
  });

  it("labels files with >= 20 commits as hotspot", () => {
    expect(getChurnLabel(makeFileInfo(20))).toBe("hotspot");
    expect(getChurnLabel(makeFileInfo(50))).toBe("hotspot");
  });

  it("labels files with >= 10 commits as active", () => {
    expect(getChurnLabel(makeFileInfo(10))).toBe("active");
    expect(getChurnLabel(makeFileInfo(19))).toBe("active");
  });

  it("labels files with >= 5 commits as moderate", () => {
    expect(getChurnLabel(makeFileInfo(5))).toBe("moderate");
    expect(getChurnLabel(makeFileInfo(9))).toBe("moderate");
  });

  it("labels files with < 5 commits as stable", () => {
    expect(getChurnLabel(makeFileInfo(4))).toBe("stable");
    expect(getChurnLabel(makeFileInfo(1))).toBe("stable");
  });
});
