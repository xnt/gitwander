import { describe, it, expect, afterEach } from "vitest";
import { TestRepoBuilder } from "../../src/starboard/builder.js";
import {
  linearHistory,
  churnHistory,
  branchMergeHistory,
  renameHistory,
} from "../../src/starboard/scenarios.js";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

describe("linearHistory scenario", () => {
  let builder: TestRepoBuilder;

  afterEach(() => builder?.cleanup());

  it("creates the requested number of commits", () => {
    builder = TestRepoBuilder.create();
    linearHistory(builder, 7);
    expect(builder.commitCount()).toBe(7);
  });

  it("defaults to 5 commits", () => {
    builder = TestRepoBuilder.create();
    linearHistory(builder);
    expect(builder.commitCount()).toBe(5);
  });

  it("creates one file per commit", () => {
    builder = TestRepoBuilder.create();
    linearHistory(builder, 3);

    for (let i = 1; i <= 3; i++) {
      expect(existsSync(path.join(builder.repoPath, `file-${i}.ts`))).toBe(true);
    }
  });

  it("uses deterministic author metadata", () => {
    builder = TestRepoBuilder.create();
    linearHistory(builder, 1);

    const author = execSync("git log --format='%an' -1", {
      cwd: builder.repoPath,
      encoding: "utf-8",
    }).trim();
    expect(author).toBe("Linear Author");
  });
});

describe("churnHistory scenario", () => {
  let builder: TestRepoBuilder;

  afterEach(() => builder?.cleanup());

  it("creates commits with one high-churn file", () => {
    builder = TestRepoBuilder.create();
    churnHistory(builder);

    const count = builder.commitCount();
    expect(count).toBe(13);
  });

  it("hot-file appears in most commits", () => {
    builder = TestRepoBuilder.create();
    churnHistory(builder);

    const hotFileCommits = execSync(
      "git log --oneline -- hot-file.ts",
      { cwd: builder.repoPath, encoding: "utf-8" },
    ).trim().split("\n").length;

    expect(hotFileCommits).toBeGreaterThanOrEqual(10);
  });

  it("stable files appear in few commits", () => {
    builder = TestRepoBuilder.create();
    churnHistory(builder);

    const stableCommits = execSync(
      "git log --oneline -- stable-a.ts",
      { cwd: builder.repoPath, encoding: "utf-8" },
    ).trim().split("\n").length;

    expect(stableCommits).toBeLessThanOrEqual(3);
  });
});

describe("branchMergeHistory scenario", () => {
  let builder: TestRepoBuilder;

  afterEach(() => builder?.cleanup());

  it("ends on main branch after merge", () => {
    builder = TestRepoBuilder.create();
    branchMergeHistory(builder);
    expect(builder.currentBranch()).toBe("main");
  });

  it("contains a merge commit", () => {
    builder = TestRepoBuilder.create();
    branchMergeHistory(builder);

    const log = builder.log("%s");
    expect(log).toContain("Merge feature/auth into main");
  });

  it("has files from both branches after merge", () => {
    builder = TestRepoBuilder.create();
    branchMergeHistory(builder);

    expect(existsSync(path.join(builder.repoPath, "main.ts"))).toBe(true);
    expect(existsSync(path.join(builder.repoPath, "auth.ts"))).toBe(true);
    expect(existsSync(path.join(builder.repoPath, "auth.test.ts"))).toBe(true);
  });

  it("feature branch still exists", () => {
    builder = TestRepoBuilder.create();
    branchMergeHistory(builder);

    const branches = execSync("git branch", {
      cwd: builder.repoPath,
      encoding: "utf-8",
    });
    expect(branches).toContain("feature/auth");
  });
});

describe("renameHistory scenario", () => {
  let builder: TestRepoBuilder;

  afterEach(() => builder?.cleanup());

  it("creates commits with file renames", () => {
    builder = TestRepoBuilder.create();
    renameHistory(builder);

    expect(builder.commitCount()).toBe(4);
  });

  it("final state has renamed files in lib/", () => {
    builder = TestRepoBuilder.create();
    renameHistory(builder);

    expect(existsSync(path.join(builder.repoPath, "utils.ts"))).toBe(false);
    expect(existsSync(path.join(builder.repoPath, "lib/helpers.ts"))).toBe(true);
    expect(existsSync(path.join(builder.repoPath, "lib/format.ts"))).toBe(true);
  });

  it("git log shows rename history", () => {
    builder = TestRepoBuilder.create();
    renameHistory(builder);

    const log = builder.log("%s");
    expect(log).toContain("Move utils to lib/");
    expect(log).toContain("Rename utils to helpers");
  });
});
