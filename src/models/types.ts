export interface FileChange {
  path: string;
  additions: number;
  deletions: number;
}

export interface Commit {
  hash: string;
  shortHash: string;
  author: string;
  date: Date;
  message: string;
  files: FileChange[];
}

export interface FileInfo {
  path: string;
  commitCount: number;
  totalAdditions: number;
  totalDeletions: number;
  lastModified: Date;
  firstSeen: Date;
  recentCommits: Commit[];
}

export interface FileGroup {
  directory: string;
  files: FileInfo[];
  totalChurn: number;
}

export type Mode = "trail" | "terrain";
export type FocusedPane = "list" | "detail";

export interface AppState {
  mode: Mode;
  repoPath: string;
  commits: Commit[];
  files: FileInfo[];
  groups: FileGroup[];
  selectedIndex: number;
  focusedPane: FocusedPane;
  detailScrollOffset: number;
  loading: boolean;
  error: string | null;
}
