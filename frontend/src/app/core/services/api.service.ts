import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { CorpusStats, CorpusUploadRequest, CorpusSearchResult, StatusResponse, TagDistribution } from '../models/corpus.model';
import { ProbabilityResponse } from '../models/probability.model';
import { ViterbiRequest, ViterbiResult, TagDescription, EaglesCategory } from '../models/viterbi.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Corpus ────────────────────────────────────────────

  uploadCorpus(request: CorpusUploadRequest): Observable<StatusResponse> {
    return this.http.post<StatusResponse>(`${this.baseUrl}/api/corpus/upload`, request);
  }

  getUploadStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.baseUrl}/api/corpus/upload/status`);
  }

  getCorpusStats(): Observable<CorpusStats> {
    return this.http.get<CorpusStats>(`${this.baseUrl}/api/corpus/stats`);
  }

  searchWord(word: string, limit = 20): Observable<CorpusSearchResult> {
    return this.http.post<CorpusSearchResult>(`${this.baseUrl}/api/corpus/search`, { word, limit });
  }

  getTagDistribution(): Observable<TagDistribution> {
    return this.http.get<TagDistribution>(`${this.baseUrl}/api/corpus/tags`);
  }

  // ── Probabilidades ────────────────────────────────────

  trainModel(): Observable<StatusResponse> {
    return this.http.post<StatusResponse>(`${this.baseUrl}/api/probabilities/train`, {});
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

  // ── Exportación ───────────────────────────────────────

  downloadEmissionExcel(topN = 30): string {
    return `${this.baseUrl}/api/exports/emission/excel?top_n=${topN}`;
  }

  downloadTransitionExcel(): string {
    return `${this.baseUrl}/api/exports/transition/excel`;
  }

  downloadViterbiExcel(sentence: string): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/api/exports/viterbi/excel`, { sentence }, { responseType: 'blob' });
  }

  downloadNotebook(): string {
    return `${this.baseUrl}/api/exports/notebook`;
  }

  downloadZip(): string {
    return `${this.baseUrl}/api/exports/zip`;
  }
}
