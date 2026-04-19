import { TestRepoBuilder } from "./builder.js";

/**
 * Linear history: a sequence of commits on a single branch.
 * Each commit touches a different file.
 */
export function linearHistory(builder: TestRepoBuilder, commitCount = 5): TestRepoBuilder {
  const baseDate = new Date("2024-01-01T10:00:00Z");

  for (let i = 1; i <= commitCount; i++) {
    const date = new Date(baseDate.getTime() + i * 86400000);
    builder
      .writeFile(`file-${i}.ts`, `// file ${i}\nexport const value = ${i};\n`)
      .commit({
        message: `Add file-${i}`,
        author: "Linear Author",
        email: "linear@test.dev",
        date,
      });
  }

  return builder;
}

/**
 * Churn history: one "hot" file gets modified many times,
 * plus a few stable files that are touched rarely.
 */
export function churnHistory(builder: TestRepoBuilder): TestRepoBuilder {
  const baseDate = new Date("2024-02-01T10:00:00Z");

  builder
    .writeFile("hot-file.ts", "// v1\n")
    .writeFile("stable-a.ts", "export const a = 1;\n")
    .writeFile("stable-b.ts", "export const b = 2;\n")
    .commit({
      message: "Initial files",
      author: "Churn Author",
      date: baseDate,
    });

  for (let i = 2; i <= 12; i++) {
    const date = new Date(baseDate.getTime() + i * 3600000);
    builder
      .updateFile("hot-file.ts", `// v${i}\nexport const iteration = ${i};\n`)
      .commit({
        message: `Update hot-file v${i}`,
        author: "Churn Author",
        date,
      });
  }

  builder
    .updateFile("stable-a.ts", "export const a = 2; // updated once\n")
    .commit({
      message: "Rare update to stable-a",
      author: "Churn Author",
      date: new Date(baseDate.getTime() + 20 * 3600000),
    });

  return builder;
}

/**
 * Branch + merge history: main branch with a feature branch
 * that gets merged back via --no-ff.
 */
export function branchMergeHistory(builder: TestRepoBuilder): TestRepoBuilder {
  const baseDate = new Date("2024-03-01T10:00:00Z");

  builder
    .writeFile("main.ts", "// main module\nexport const main = true;\n")
    .commit({
      message: "Initial commit on main",
      author: "Main Dev",
      date: baseDate,
    });

  builder.createAndSwitchBranch("feature/auth");

  builder
    .writeFile("auth.ts", "export function login() { return true; }\n")
    .commit({
      message: "Add auth module",
      author: "Feature Dev",
      date: new Date(baseDate.getTime() + 86400000),
    });

  builder
    .writeFile("auth.test.ts", "import { login } from './auth';\n")
    .commit({
      message: "Add auth tests",
      author: "Feature Dev",
      date: new Date(baseDate.getTime() + 2 * 86400000),
    });

  builder.switchBranch("main");

  builder
    .updateFile("main.ts", "// main module\nexport const main = true;\nexport const version = 2;\n")
    .commit({
      message: "Update main module",
      author: "Main Dev",
      date: new Date(baseDate.getTime() + 3 * 86400000),
    });

  builder.mergeBranch("feature/auth", "Merge feature/auth into main");

  return builder;
}

/**
 * Rename history: files that get renamed/moved across commits.
 */
export function renameHistory(builder: TestRepoBuilder): TestRepoBuilder {
  const baseDate = new Date("2024-04-01T10:00:00Z");

  builder
    .writeFile("utils.ts", "export function helper() {}\n")
    .writeFile("app.ts", "import { helper } from './utils';\n")
    .commit({
      message: "Initial structure",
      author: "Rename Author",
      date: baseDate,
    });

  builder
    .renameFile("utils.ts", "lib/utils.ts")
    .commit({
      message: "Move utils to lib/",
      author: "Rename Author",
      date: new Date(baseDate.getTime() + 86400000),
    });

  builder
    .renameFile("lib/utils.ts", "lib/helpers.ts")
    .commit({
      message: "Rename utils to helpers",
      author: "Rename Author",
      date: new Date(baseDate.getTime() + 2 * 86400000),
    });

  builder
    .writeFile("lib/format.ts", "export function format(s: string) { return s.trim(); }\n")
    .commit({
      message: "Add format utility",
      author: "Rename Author",
      date: new Date(baseDate.getTime() + 3 * 86400000),
    });

  return builder;
}
