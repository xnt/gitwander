import { describe, it, expect, afterEach } from "vitest";
import { TestRepoBuilder } from "../../src/starboard/builder.js";
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

describe("TestRepoBuilder", () => {
  let builder: TestRepoBuilder;

  afterEach(() => {
    builder?.cleanup();
  });

  it("creates a real git repo in a temp directory", () => {
    builder = TestRepoBuilder.create();
    expect(existsSync(builder.repoPath)).toBe(true);
    expect(existsSync(path.join(builder.repoPath, ".git"))).toBe(true);
  });

  it("writeFile creates files and nested directories", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("src/deep/nested/file.ts", "content");
    const full = path.join(builder.repoPath, "src/deep/nested/file.ts");
    expect(readFileSync(full, "utf-8")).toBe("content");
  });

  it("commit creates real git commits", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("a.txt", "hello").commit("First commit");

    const count = builder.commitCount();
    expect(count).toBe(1);

    const log = builder.log();
    expect(log).toContain("First commit");
  });

  it("commit supports custom author and date", () => {
    builder = TestRepoBuilder.create();
    builder
      .writeFile("a.txt", "hello")
      .commit({
        message: "Authored commit",
        author: "Custom Author",
        email: "custom@test.dev",
        date: new Date("2024-06-15T12:00:00Z"),
      });

    const authorLog = execSync("git log --format='%an' -1", {
      cwd: builder.repoPath,
      encoding: "utf-8",
    }).trim();
    expect(authorLog).toBe("Custom Author");

    const dateLog = execSync("git log --format='%aI' -1", {
      cwd: builder.repoPath,
      encoding: "utf-8",
    }).trim();
    expect(dateLog).toContain("2024-06-15");
  });

  it("updateFile overwrites file content", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("a.txt", "v1").commit("v1");
    builder.updateFile("a.txt", "v2").commit("v2");

    const content = readFileSync(path.join(builder.repoPath, "a.txt"), "utf-8");
    expect(content).toBe("v2");
    expect(builder.commitCount()).toBe(2);
  });

  it("appendFile adds to existing content", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("a.txt", "line1\n").commit("first");
    builder.appendFile("a.txt", "line2\n").commit("append");

    const content = readFileSync(path.join(builder.repoPath, "a.txt"), "utf-8");
    expect(content).toBe("line1\nline2\n");
  });

  it("deleteFile removes files from the working tree", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("doomed.txt", "bye").commit("add");
    builder.deleteFile("doomed.txt").commit("remove");

    expect(existsSync(path.join(builder.repoPath, "doomed.txt"))).toBe(false);
    expect(builder.commitCount()).toBe(2);
  });

  it("renameFile moves files via git mv", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("old.ts", "content").commit("add");
    builder.renameFile("old.ts", "new.ts").commit("rename");

    expect(existsSync(path.join(builder.repoPath, "old.ts"))).toBe(false);
    expect(readFileSync(path.join(builder.repoPath, "new.ts"), "utf-8")).toBe("content");
  });

  it("createBranch and switchBranch work correctly", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("a.txt", "main").commit("initial");

    builder.createBranch("feature");
    builder.switchBranch("feature");
    expect(builder.currentBranch()).toBe("feature");

    builder.switchBranch("main");
    expect(builder.currentBranch()).toBe("main");
  });

  it("createAndSwitchBranch creates and checks out in one step", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("a.txt", "x").commit("init");
    builder.createAndSwitchBranch("dev");
    expect(builder.currentBranch()).toBe("dev");
  });

  it("mergeBranch merges a branch with --no-ff", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("a.txt", "main").commit("init");

    builder.createAndSwitchBranch("feat");
    builder.writeFile("b.txt", "feature").commit("feat commit");

    builder.switchBranch("main");
    builder.mergeBranch("feat");

    expect(readFileSync(path.join(builder.repoPath, "b.txt"), "utf-8")).toBe("feature");
    const log = builder.log();
    expect(log).toContain("Merge branch 'feat'");
  });

  it("tag creates lightweight tags", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("a.txt", "v1").commit("v1");
    builder.tag("v1.0");

    const tags = execSync("git tag", {
      cwd: builder.repoPath,
      encoding: "utf-8",
    }).trim();
    expect(tags).toBe("v1.0");
  });

  it("tag creates annotated tags with a message", () => {
    builder = TestRepoBuilder.create();
    builder.writeFile("a.txt", "v1").commit("v1");
    builder.tag("v1.0", "Release v1.0");

    const tagMsg = execSync("git tag -n1 v1.0", {
      cwd: builder.repoPath,
      encoding: "utf-8",
    }).trim();
    expect(tagMsg).toContain("Release v1.0");
  });

  it("cleanup removes the temp directory", () => {
    builder = TestRepoBuilder.create();
    const p = builder.repoPath;
    expect(existsSync(p)).toBe(true);
    builder.cleanup();
    expect(existsSync(p)).toBe(false);
  });

  it("cleanup is idempotent", () => {
    builder = TestRepoBuilder.create();
    builder.cleanup();
    expect(() => builder.cleanup()).not.toThrow();
  });
});
