#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import { App } from "./app.js";
import { isGitRepo, getRepoRoot } from "./git/reader.js";
import path from "node:path";

const targetPath = process.argv[2] ?? process.cwd();
const resolved = path.resolve(targetPath);

if (!isGitRepo(resolved)) {
  console.error(`Error: "${resolved}" is not inside a Git repository.`);
  process.exit(1);
}

const repoRoot = getRepoRoot(resolved);

const { unmount, waitUntilExit } = render(
  <App repoPath={repoRoot} onExit={() => unmount()} />,
);

await waitUntilExit();
