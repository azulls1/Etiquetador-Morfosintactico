export interface CorpusStats {
  total_tokens: number;
  total_sentences: number;
  total_documents: number;
  unique_tags: number;
  unique_words: number;
  processed_files: number;
  is_loaded: boolean;
}

export interface CorpusUploadRequest {
  corpus_dir?: string;
  max_files?: number;
}

export interface CorpusSearchResult {
  word: string;
  tags: Record<string, number>;
  total_occurrences: number;
}

export interface TagDistribution {
  total_tokens: number;
  tags: TagCount[];
}

export interface TagCount {
  tag: string;
  count: number;
  percentage: number;
}

export interface StatusResponse {
  status: string;
  message: string;
  detail?: any;
}
