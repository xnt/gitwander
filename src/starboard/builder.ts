import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, appendFileSync, rmSync, unlinkSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { CommitOptions } from "./types.js";

export class TestRepoBuilder {
  readonly repoPath: string;
  private _cleaned = false;

  private constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  static create(prefix = "gitwander-test-"): TestRepoBuilder {
    const dir = mkdtempSync(path.join(tmpdir(), prefix));
    const builder = new TestRepoBuilder(dir);
    builder.git("init");
    builder.git("config user.name 'Test User'");
    builder.git("config user.email 'test@gitwander.dev'");
    return builder;
  }

  writeFile(filePath: string, content: string): this {
    const full = path.join(this.repoPath, filePath);
    const dir = path.dirname(full);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(full, content, "utf-8");
    return this;
  }

  updateFile(filePath: string, content: string): this {
    return this.writeFile(filePath, content);
  }

  appendFile(filePath: string, content: string): this {
    const full = path.join(this.repoPath, filePath);
    appendFileSync(full, content, "utf-8");
    return this;
  }

  deleteFile(filePath: string): this {
    const full = path.join(this.repoPath, filePath);
    unlinkSync(full);
    this.git(`add "${filePath}"`);
    return this;
  }

  renameFile(oldPath: string, newPath: string): this {
    const fullNew = path.join(this.repoPath, newPath);
    const dir = path.dirname(fullNew);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    this.git(`mv "${oldPath}" "${newPath}"`);
    return this;
  }

  commit(opts: string | CommitOptions): this {
    const options: CommitOptions = typeof opts === "string" ? { message: opts } : opts;
    this.git("add -A");

    const env = this.buildCommitEnv(options);
    const msg = options.message.replace(/"/g, '\\"');
    this.git(`commit --allow-empty -m "${msg}"`, env);
    return this;
  }

  createBranch(name: string): this {
    this.git(`branch "${name}"`);
    return this;
  }

  switchBranch(name: string): this {
    this.git(`checkout "${name}"`);
    return this;
  }

  createAndSwitchBranch(name: string): this {
    this.git(`checkout -b "${name}"`);
    return this;
  }

  mergeBranch(name: string, message?: string): this {
    const msg = message ?? `Merge branch '${name}'`;
    this.git(`merge "${name}" --no-ff -m "${msg.replace(/"/g, '\\"')}"`);
    return this;
  }

  tag(name: string, message?: string): this {
    if (message) {
      this.git(`tag -a "${name}" -m "${message.replace(/"/g, '\\"')}"`);
    } else {
      this.git(`tag "${name}"`);
    }
    return this;
  }

  currentBranch(): string {
    return this.git("rev-parse --abbrev-ref HEAD").trim();
  }

  log(format = "%h %s"): string {
    return this.git(`log --format="${format}"`);
  }

  commitCount(): number {
    return parseInt(this.git("rev-list --count HEAD").trim(), 10);
  }

  cleanup(): void {
    if (this._cleaned) return;
    rmSync(this.repoPath, { recursive: true, force: true });
    this._cleaned = true;
  }

  private git(args: string, extraEnv?: Record<string, string>): string {
    return execSync(`git ${args}`, {
      cwd: this.repoPath,
      encoding: "utf-8",
      env: { ...process.env, ...extraEnv },
      stdio: ["pipe", "pipe", "pipe"],
    });
  }

  private buildCommitEnv(opts: CommitOptions): Record<string, string> {
    const env: Record<string, string> = {};

    if (opts.author) {
      env.GIT_AUTHOR_NAME = opts.author;
      env.GIT_COMMITTER_NAME = opts.author;
    }
    if (opts.email) {
      env.GIT_AUTHOR_EMAIL = opts.email;
      env.GIT_COMMITTER_EMAIL = opts.email;
    }
    if (opts.date) {
      const iso = opts.date.toISOString();
      env.GIT_AUTHOR_DATE = iso;
      env.GIT_COMMITTER_DATE = iso;
    }

    return env;
  }
}
