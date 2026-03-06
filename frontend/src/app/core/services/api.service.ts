import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { CorpusStats, CorpusUploadRequest, CorpusSearchResult, StatusResponse, TagDistribution } from '../models/corpus.model';
import { ProbabilityResponse } from '../models/probability.model';
import { ViterbiRequest, ViterbiResult, TagDescription, EaglesCategory, QuickSentence, AnalysisQuestion, EvaluationResult, EaglesExample, EaglesPosition, ExportChecklistItem } from '../models/viterbi.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Corpus ────────────────────────────────────────────

  uploadCorpus(request: CorpusUploadRequest): Observable<StatusResponse> {
    return this.http.post<StatusResponse>(`${this.baseUrl}/api/corpus/upload`, request);
  }

  uploadCorpusFile(file: File): Observable<StatusResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<StatusResponse>(`${this.baseUrl}/api/corpus/upload-file`, formData);
  }

  processCorpus(maxFiles?: number): Observable<StatusResponse> {
    let params = new HttpParams();
    if (maxFiles) params = params.set('max_files', maxFiles);
    return this.http.post<StatusResponse>(`${this.baseUrl}/api/corpus/process`, null, { params });
  }

  scanCorpusDir(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.baseUrl}/api/corpus/scan`);
  }

  getUploadStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.baseUrl}/api/corpus/upload/status`);
  }

  getCorpusStats(): Observable<CorpusStats> {
    return this.http.get<CorpusStats>(`${this.baseUrl}/api/corpus/stats`);
  }

  searchWord(word: string, limit = 20): Observable<CorpusSearchResult> {
    const params = new HttpParams().set('word', word).set('limit', limit);
    return this.http.get<CorpusSearchResult>(`${this.baseUrl}/api/corpus/search`, { params });
  }

  getTagDistribution(): Observable<TagDistribution> {
    return this.http.get<TagDistribution>(`${this.baseUrl}/api/corpus/tags`);
  }

  // ── Probabilidades ────────────────────────────────────

  trainModel(): Observable<StatusResponse> {
    return this.http.post<StatusResponse>(`${this.baseUrl}/api/probabilities/train`, {});
  }

  getTrainingStatus(taskId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/probabilities/train/status/${taskId}`);
  }

  getEmissionProbs(tag?: string, limit = 20): Observable<ProbabilityResponse> {
    let params = new HttpParams().set('limit', limit);
    if (tag) params = params.set('tag', tag);
    return this.http.get<ProbabilityResponse>(`${this.baseUrl}/api/probabilities/emission`, { params });
  }

  getTransitionProbs(tag?: string, direction = 'from', limit = 20): Observable<ProbabilityResponse> {
    let params = new HttpParams().set('limit', limit).set('direction', direction);
    if (tag) params = params.set('tag', tag);
    return this.http.get<ProbabilityResponse>(`${this.baseUrl}/api/probabilities/transition`, { params });
  }

  getEmissionTable(topN = 30): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/probabilities/emission/table`, {
      params: new HttpParams().set('top_n', topN)
    });
  }

  getTransitionTable(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/probabilities/transition/table`);
  }

  // ── Viterbi ───────────────────────────────────────────

  tagSentence(sentence: string): Observable<ViterbiResult> {
    return this.http.post<ViterbiResult>(`${this.baseUrl}/api/viterbi/tag`, { sentence });
  }

  getTaggingHistory(limit = 50): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/viterbi/history`, {
      params: new HttpParams().set('limit', limit)
    });
  }

  // ── Etiquetas EAGLES ──────────────────────────────────

  describeTag(tag: string): Observable<TagDescription> {
    return this.http.get<TagDescription>(`${this.baseUrl}/api/tags/describe/${tag}`);
  }

  getCategories(): Observable<{ categories: EaglesCategory[] }> {
    return this.http.get<{ categories: EaglesCategory[] }>(`${this.baseUrl}/api/tags/categories`);
  }

  describeBatch(tags: string[]): Observable<{ descriptions: TagDescription[] }> {
    return this.http.post<{ descriptions: TagDescription[] }>(`${this.baseUrl}/api/tags/describe-batch`, tags);
  }

  getTagColors(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.baseUrl}/api/tags/colors`);
  }

  // ── EAGLES Reference Data ──────────────────────────

  getEaglesExamples(): Observable<{ examples: EaglesExample[] }> {
    return this.http.get<{ examples: EaglesExample[] }>(`${this.baseUrl}/api/eagles/examples`);
  }

  getEaglesPositions(): Observable<{ positions: EaglesPosition[] }> {
    return this.http.get<{ positions: EaglesPosition[] }>(`${this.baseUrl}/api/eagles/positions`);
  }

  // ── Oraciones rápidas ───────────────────────────────

  getQuickSentences(): Observable<{ sentences: QuickSentence[] }> {
    return this.http.get<{ sentences: QuickSentence[] }>(`${this.baseUrl}/api/sentences`);
  }

  createQuickSentence(sentence: string, sortOrder = 0): Observable<QuickSentence> {
    return this.http.post<QuickSentence>(`${this.baseUrl}/api/sentences`, { sentence, sort_order: sortOrder });
  }

  deleteQuickSentence(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/sentences/${id}`);
  }

  // ── Analisis (preguntas Q&A) ──────────────────────

  getAnalysisQuestions(): Observable<{ questions: AnalysisQuestion[] }> {
    return this.http.get<{ questions: AnalysisQuestion[] }>(`${this.baseUrl}/api/analysis/questions`);
  }

  // ── Evaluacion cuantitativa ───────────────────────

  runEvaluation(params?: { test_ratio?: number; smoothing?: number; seed?: number; max_files?: number; max_sentences?: number; top_n_tags?: number }): Observable<EvaluationResult> {
    let httpParams = new HttpParams();
    if (params?.test_ratio !== undefined) httpParams = httpParams.set('test_ratio', params.test_ratio);
    if (params?.smoothing !== undefined) httpParams = httpParams.set('smoothing', params.smoothing);
    if (params?.seed !== undefined) httpParams = httpParams.set('seed', params.seed);
    if (params?.max_files !== undefined) httpParams = httpParams.set('max_files', params.max_files);
    if (params?.max_sentences !== undefined) httpParams = httpParams.set('max_sentences', params.max_sentences);
    if (params?.top_n_tags !== undefined) httpParams = httpParams.set('top_n_tags', params.top_n_tags);
    return this.http.post<EvaluationResult>(`${this.baseUrl}/api/evaluation/evaluate`, null, { params: httpParams });
  }

  // ── Export Checklist ─────────────────────────────────

  getExportChecklist(): Observable<{ items: ExportChecklistItem[] }> {
    return this.http.get<{ items: ExportChecklistItem[] }>(`${this.baseUrl}/api/exports/checklist`);
  }

  // ── Exportación (blob downloads) ─────────────────────

  downloadEmissionExcelBlob(topN = 30): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/exports/emission/excel`, {
      params: new HttpParams().set('top_n', topN),
      responseType: 'blob',
    });
  }

  downloadTransitionExcelBlob(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/exports/transition/excel`, { responseType: 'blob' });
  }

  downloadViterbiExcel(sentence: string): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/api/exports/viterbi/excel`, { sentence }, { responseType: 'blob' });
  }

  downloadNotebookBlob(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/exports/notebook`, { responseType: 'blob' });
  }

  downloadZipBlob(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/exports/zip`, { responseType: 'blob' });
  }

  // ── Exportación (URL directas — legacy) ────────────

  downloadEmissionExcel(topN = 30): string {
    return `${this.baseUrl}/api/exports/emission/excel?top_n=${topN}`;
  }

  downloadTransitionExcel(): string {
    return `${this.baseUrl}/api/exports/transition/excel`;
  }

  downloadNotebook(): string {
    return `${this.baseUrl}/api/exports/notebook`;
  }

  downloadZip(): string {
    return `${this.baseUrl}/api/exports/zip`;
  }
}
