export type Difficulty = "Easy" | "Medium" | "Hard";
export type Platform = "leetcode" | "gfg";

export interface Problem {
  id: number;
  title: string;
  url: string;
  platform: Platform;
  topic: string;
  pattern: string;
  difficulty: Difficulty;
  core: boolean;
  sources: string[];
}

export interface Meta {
  topics: string[];
  patterns: { name: string; cue: string }[];
}

export type View = "topic" | "pattern";
