import { describe, it, expect, afterEach } from "vitest";
import { TestRepoBuilder } from "../../src/starboard/builder.js";
import { linearHistory, churnHistory, branchMergeHistory } from "../../src/starboard/scenarios.js";
import { readGitLog } from "../../src/git/reader.js";
import { parseGitLog } from "../../src/git/parser.js";
import { buildFileInfos, getChurnLabel } from "../../src/analysis/churn.js";
import { groupFilesByDirectory } from "../../src/analysis/grouping.js";

describe("GitWander pipeline with Starboard repos", () => {
  let builder: TestRepoBuilder;

  afterEach(() => builder?.cleanup());

  it("reads and parses a linear history repo", () => {
    builder = TestRepoBuilder.create();
    linearHistory(builder, 5);

    const raw = readGitLog(builder.repoPath);
    const commits = parseGitLog(raw);

    expect(commits).toHaveLength(5);
    expect(commits[0].author).toBe("Linear Author");
    expect(commits[0].message).toBe("Add file-5");
  });

  it("detects churn correctly from a churn history repo", () => {
    builder = TestRepoBuilder.create();
    churnHistory(builder);

    const raw = readGitLog(builder.repoPath);
    const commits = parseGitLog(raw);
    const files = buildFileInfos(commits);

    const hotFile = files.find((f) => f.path === "hot-file.ts");
    expect(hotFile).toBeDefined();
    expect(hotFile!.commitCount).toBeGreaterThanOrEqual(10);
    expect(getChurnLabel(hotFile!)).toBe("active");

    const stableFile = files.find((f) => f.path === "stable-b.ts");
    expect(stableFile).toBeDefined();
    expect(stableFile!.commitCount).toBe(1);
    expect(getChurnLabel(stableFile!)).toBe("stable");
  });

  it("groups files by directory from a real repo", () => {
    builder = TestRepoBuilder.create();
    linearHistory(builder, 3);

    const raw = readGitLog(builder.repoPath);
    const commits = parseGitLog(raw);
    const files = buildFileInfos(commits);
    const groups = groupFilesByDirectory(files);

    expect(groups.length).toBeGreaterThanOrEqual(1);
    expect(groups[0].files.length).toBeGreaterThanOrEqual(1);
    expect(groups[0].totalChurn).toBeGreaterThanOrEqual(1);
  });

  it("handles merge commits from branch+merge scenario", () => {
    builder = TestRepoBuilder.create();
    branchMergeHistory(builder);

    const raw = readGitLog(builder.repoPath);
    const commits = parseGitLog(raw);

    expect(commits.length).toBeGreaterThanOrEqual(4);

    const mergeCommit = commits.find((c) =>
      c.message.includes("Merge feature/auth"),
    );
    expect(mergeCommit).toBeDefined();
  });

  it("file date ranges reflect the scripted timeline", () => {
    builder = TestRepoBuilder.create();
    linearHistory(builder, 3);

    const raw = readGitLog(builder.repoPath);
    const commits = parseGitLog(raw);
    const files = buildFileInfos(commits);

    for (const file of files) {
      expect(file.lastModified).toBeInstanceOf(Date);
      expect(file.firstSeen).toBeInstanceOf(Date);
      expect(file.lastModified.getTime()).toBeGreaterThanOrEqual(file.firstSeen.getTime());
    }
  });
});
