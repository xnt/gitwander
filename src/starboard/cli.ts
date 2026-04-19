#!/usr/bin/env node
import { TestRepoBuilder } from "./builder.js";
import { linearHistory, churnHistory, branchMergeHistory, renameHistory } from "./scenarios.js";

const SCENARIOS: Record<string, { run: (b: TestRepoBuilder, opts: Record<string, string>) => void; desc: string }> = {
  linear: {
    desc: "Linear history with one file per commit (--commits N)",
    run: (b, opts) => linearHistory(b, parseInt(opts.commits ?? "5", 10)),
  },
  churn: {
    desc: "One high-churn file + a few stable files",
    run: (b) => churnHistory(b),
  },
  "branch-merge": {
    desc: "Main branch with a feature branch merged back",
    run: (b) => branchMergeHistory(b),
  },
  rename: {
    desc: "Files that get renamed/moved across commits",
    run: (b) => renameHistory(b),
  },
};

function parseArgs(args: string[]): { scenario: string; opts: Record<string, string> } {
  const scenario = args[0] ?? "";
  const opts: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--") && i + 1 < args.length) {
      opts[arg.slice(2)] = args[++i];
    }
  }

  return { scenario, opts };
}

function printUsage(): void {
  console.log("Usage: starboard <scenario> [options]\n");
  console.log("Scenarios:");
  for (const [name, { desc }] of Object.entries(SCENARIOS)) {
    console.log(`  ${name.padEnd(16)} ${desc}`);
  }
  console.log("\nThe generated repo is left on disk for you to inspect.");
  console.log("Delete it manually when done.");
}

const { scenario, opts } = parseArgs(process.argv.slice(2));

if (!scenario || scenario === "--help" || scenario === "-h") {
  printUsage();
  process.exit(scenario ? 0 : 1);
}

const entry = SCENARIOS[scenario];
if (!entry) {
  console.error(`Unknown scenario: "${scenario}"\n`);
  printUsage();
  process.exit(1);
}

const builder = TestRepoBuilder.create("starboard-");
try {
  entry.run(builder, opts);
  console.log(`Scenario "${scenario}" created successfully.\n`);
  console.log(`  Path:    ${builder.repoPath}`);
  console.log(`  Commits: ${builder.commitCount()}`);
  console.log(`  Branch:  ${builder.currentBranch()}`);
  console.log(`\nTo inspect:\n  cd ${builder.repoPath}\n  git log --oneline --graph`);
  console.log(`\nTo clean up:\n  rm -rf ${builder.repoPath}`);
} catch (err) {
  console.error("Failed to generate scenario:", err instanceof Error ? err.message : err);
  builder.cleanup();
  process.exit(1);
}
