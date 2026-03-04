export interface EmissionEntry {
  tag: string;
  tag_count: number;
  top_words: WordProbability[];
}

export interface WordProbability {
  word: string;
  count: number;
  probability: number;
}

export interface TransitionEntry {
  tag_prev: string;
  tag_next: string;
  count: number;
  probability: number;
}

export interface ProbabilityResponse {
  total_entries: number;
  entries: any[];
}
