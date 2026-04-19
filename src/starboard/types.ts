export interface CommitOptions {
  message: string;
  author?: string;
  email?: string;
  date?: Date;
}

export interface ScenarioOptions {
  commitCount?: number;
}
