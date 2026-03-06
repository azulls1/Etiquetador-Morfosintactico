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

export interface QuickSentence {
  id: number;
  sentence: string;
  sort_order: number;
}

export interface AnalysisQuestion {
  id: number;
  sort_order: number;
  question: string;
  answer_html: string;
}

export interface EaglesExample {
  id: number;
  tag: string;
  category: string;
  description: string;
  sort_order: number;
}

export interface EaglesPosition {
  id: number;
  position: string;
  attribute: string;
  possible_values: string;
  example_char: string;
  color_class: string;
  sort_order: number;
}

export interface ExportChecklistItem {
  id: number;
  label: string;
  sort_order: number;
}

export interface EvaluationSplit {
  total_sentences: number;
  train_sentences: number;
  test_sentences: number;
  test_ratio: number;
  seed: number;
}

export interface EvaluationGlobalMetrics {
  accuracy: number;
  total_tokens_evaluated: number;
  correct_tokens: number;
  unknown_words: number;
  unknown_word_ratio: number;
}

export interface EvaluationAvgMetrics {
  precision: number;
  recall: number;
  f1_score: number;
}

export interface EvaluationResult {
  split: EvaluationSplit;
  global_metrics: EvaluationGlobalMetrics;
  macro_avg: EvaluationAvgMetrics;
  weighted_avg: EvaluationAvgMetrics;
  per_tag_metrics: Record<string, any>[];
  confusion_matrix: { tags: string[]; matrix: Record<string, Record<string, number>> };
  sentence_accuracy_distribution: { mean: number; min: number; max: number; total_sentences_evaluated: number };
  model_params: Record<string, any>;
}
