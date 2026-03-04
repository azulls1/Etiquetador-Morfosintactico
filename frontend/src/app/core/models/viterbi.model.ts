export interface ViterbiRequest {
  sentence: string;
}

export interface ViterbiStep {
  token: string;
  tag: string;
  probability: number;
  description: string;
}

export interface ViterbiResult {
  sentence: string;
  tokens: string[];
  tags: string[];
  descriptions: string[];
  steps: ViterbiStep[];
  viterbi_matrix: Record<string, any>[];
  backpointers: Record<string, any>[];
  best_path_prob: number;
}

export interface TagDescription {
  tag: string;
  category: string;
  description: string;
  full_description: string;
}

export interface EaglesCategory {
  code: string;
  name: string;
  subcategories: { code: string; name: string }[];
}
