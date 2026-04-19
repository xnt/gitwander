import { describe, it, expect } from "vitest";
import { parseGitLog } from "../src/git/parser.js";

const SAMPLE_LOG = `---GITWANDER-COMMIT---
abc123def456abc123def456abc123def456abc12345
abc123d
Alice Smith
2024-03-15T10:30:00+00:00
Add new feature
5\t2\tsrc/app.ts
10\t0\tsrc/utils.ts
---GITWANDER-COMMIT---
def456abc123def456abc123def456abc123def45678
def456a
Bob Jones
2024-03-14T09:00:00+00:00
Fix bug in parser
3\t1\tsrc/parser.ts
`;

const BINARY_FILE_LOG = `---GITWANDER-COMMIT---
aaa111bbb222ccc333ddd444eee555fff666aaa1112
aaa111b
Charlie
2024-01-01T00:00:00+00:00
Add image
-\t-\tassets/logo.png
2\t0\tREADME.md
`;

describe("parseGitLog", () => {
  it("parses multiple commits from raw git log output", () => {
    const commits = parseGitLog(SAMPLE_LOG);
    expect(commits).toHaveLength(2);
  });

  it("extracts commit metadata correctly", () => {
    const commits = parseGitLog(SAMPLE_LOG);
    const first = commits[0];

    expect(first.hash).toBe("abc123def456abc123def456abc123def456abc12345");
    expect(first.shortHash).toBe("abc123d");
    expect(first.author).toBe("Alice Smith");
    expect(first.message).toBe("Add new feature");
    expect(first.date).toBeInstanceOf(Date);
  });

  it("parses numstat file changes", () => {
    const commits = parseGitLog(SAMPLE_LOG);
    const first = commits[0];

    expect(first.files).toHaveLength(2);
    expect(first.files[0]).toEqual({
      path: "src/app.ts",
      additions: 5,
      deletions: 2,
    });
    expect(first.files[1]).toEqual({
      path: "src/utils.ts",
      additions: 10,
      deletions: 0,
    });
  });

  it("handles binary files (- in numstat)", () => {
    const commits = parseGitLog(BINARY_FILE_LOG);
    expect(commits).toHaveLength(1);
    expect(commits[0].files[0]).toEqual({
      path: "assets/logo.png",
      additions: 0,
      deletions: 0,
    });
  });

  it("returns empty array for empty input", () => {
    expect(parseGitLog("")).toEqual([]);
    expect(parseGitLog("   \n  ")).toEqual([]);
  });

  it("skips malformed blocks", () => {
    const bad = `---GITWANDER-COMMIT---
incomplete
`;
    const commits = parseGitLog(bad);
    expect(commits).toHaveLength(0);
  });
});
