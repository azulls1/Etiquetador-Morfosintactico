import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { CorpusStats, CorpusSearchResult, StatusResponse } from '../models/corpus.model';
import { ViterbiResult, TagDescription, EaglesCategory } from '../models/viterbi.model';
import { ProbabilityResponse } from '../models/probability.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpTesting: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Corpus ────────────────────────────────────────────

  describe('uploadCorpus', () => {
    it('should POST to /api/corpus/upload with the request body', () => {
      const mockResponse: StatusResponse = { status: 'processing', message: 'Corpus upload started' };
      const request = { corpus_dir: '/data/corpus', max_files: 10 };

      service.uploadCorpus(request).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/corpus/upload`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('getUploadStatus', () => {
    it('should GET from /api/corpus/upload/status', () => {
      const mockResponse: StatusResponse = { status: 'completed', message: 'Done' };

      service.getUploadStatus().subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/corpus/upload/status`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getCorpusStats', () => {
    it('should GET from /api/corpus/stats', () => {
      const mockStats: CorpusStats = {
        total_tokens: 50000,
        total_sentences: 2000,
        total_documents: 10,
        unique_tags: 85,
        unique_words: 12000,
        processed_files: 10,
        is_loaded: true,
      };

      service.getCorpusStats().subscribe((stats) => {
        expect(stats).toEqual(mockStats);
        expect(stats.is_loaded).toBeTrue();
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/corpus/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });

    it('should propagate HTTP errors', () => {
      service.getCorpusStats().subscribe({
        next: () => fail('expected error'),
        error: (err) => {
          expect(err.status).toBe(500);
        },
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/corpus/stats`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('searchWord', () => {
    it('should POST to /api/corpus/search with word and default limit', () => {
      const mockResult: CorpusSearchResult = {
        word: 'habla',
        tags: { VMIP3S0: 15, NCFS000: 3 },
        total_occurrences: 18,
      };

      service.searchWord('habla').subscribe((res) => {
        expect(res).toEqual(mockResult);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/corpus/search`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ word: 'habla', limit: 20 });
      req.flush(mockResult);
    });

    it('should POST with custom limit', () => {
      service.searchWord('casa', 5).subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/corpus/search`);
      expect(req.request.body).toEqual({ word: 'casa', limit: 5 });
      req.flush({ word: 'casa', tags: {}, total_occurrences: 0 });
    });
  });

  describe('getTagDistribution', () => {
    it('should GET from /api/corpus/tags', () => {
      const mockDistribution = {
        total_tokens: 50000,
        tags: [{ tag: 'NCMS000', count: 5000, percentage: 10.0 }],
      };

      service.getTagDistribution().subscribe((res) => {
        expect(res.total_tokens).toBe(50000);
        expect(res.tags.length).toBe(1);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/corpus/tags`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDistribution);
    });
  });

  // ── Probabilidades ────────────────────────────────────

  describe('trainModel', () => {
    it('should POST to /api/probabilities/train with empty body', () => {
      const mockResponse: StatusResponse = { status: 'ok', message: 'Model trained successfully' };

      service.trainModel().subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/probabilities/train`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('getEmissionProbs', () => {
    it('should GET from /api/probabilities/emission with default limit', () => {
      const mockResponse: ProbabilityResponse = { total_entries: 1, entries: [] };

      service.getEmissionProbs().subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne((r) =>
        r.url === `${baseUrl}/api/probabilities/emission` && r.params.get('limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('tag')).toBeFalse();
      req.flush(mockResponse);
    });

    it('should include tag param when provided', () => {
      service.getEmissionProbs('NCMS000', 10).subscribe();

      const req = httpTesting.expectOne((r) =>
        r.url === `${baseUrl}/api/probabilities/emission` &&
        r.params.get('tag') === 'NCMS000' &&
        r.params.get('limit') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ total_entries: 0, entries: [] });
    });
  });

  describe('getTransitionProbs', () => {
    it('should GET from /api/probabilities/transition with default params', () => {
      service.getTransitionProbs().subscribe();

      const req = httpTesting.expectOne((r) =>
        r.url === `${baseUrl}/api/probabilities/transition` &&
        r.params.get('limit') === '20' &&
        r.params.get('direction') === 'from'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('tag')).toBeFalse();
      req.flush({ total_entries: 0, entries: [] });
    });

    it('should include tag and direction params', () => {
      service.getTransitionProbs('VMIP3S0', 'to', 5).subscribe();

      const req = httpTesting.expectOne((r) =>
        r.url === `${baseUrl}/api/probabilities/transition` &&
        r.params.get('tag') === 'VMIP3S0' &&
        r.params.get('direction') === 'to' &&
        r.params.get('limit') === '5'
      );
      req.flush({ total_entries: 0, entries: [] });
    });
  });

  describe('getEmissionTable', () => {
    it('should GET from /api/probabilities/emission/table with top_n param', () => {
      service.getEmissionTable(15).subscribe();

      const req = httpTesting.expectOne((r) =>
        r.url === `${baseUrl}/api/probabilities/emission/table` &&
        r.params.get('top_n') === '15'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ entries: [] });
    });
  });

  describe('getTransitionTable', () => {
    it('should GET from /api/probabilities/transition/table', () => {
      service.getTransitionTable().subscribe();

      const req = httpTesting.expectOne(`${baseUrl}/api/probabilities/transition/table`);
      expect(req.request.method).toBe('GET');
      req.flush({ entries: [] });
    });
  });

  // ── Viterbi ───────────────────────────────────────────

  describe('tagSentence', () => {
    it('should POST to /api/viterbi/tag with the sentence', () => {
      const mockResult: ViterbiResult = {
        sentence: 'El gato duerme.',
        tokens: ['El', 'gato', 'duerme', '.'],
        tags: ['DA0MS0', 'NCMS000', 'VMIP3S0', 'Fp'],
        descriptions: ['Determinante', 'Nombre', 'Verbo', 'Punto'],
        steps: [],
        viterbi_matrix: [],
        backpointers: [],
        best_path_prob: 1.23e-8,
      };

      service.tagSentence('El gato duerme.').subscribe((res) => {
        expect(res).toEqual(mockResult);
        expect(res.tokens.length).toBe(4);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/viterbi/tag`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ sentence: 'El gato duerme.' });
      req.flush(mockResult);
    });

    it('should propagate errors from tagSentence', () => {
      service.tagSentence('test').subscribe({
        next: () => fail('expected error'),
        error: (err) => {
          expect(err.status).toBe(400);
        },
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/viterbi/tag`);
      req.flush({ detail: 'Model not trained' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getTaggingHistory', () => {
    it('should GET from /api/viterbi/history with default limit', () => {
      service.getTaggingHistory().subscribe();

      const req = httpTesting.expectOne((r) =>
        r.url === `${baseUrl}/api/viterbi/history` && r.params.get('limit') === '50'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  // ── Etiquetas EAGLES ──────────────────────────────────

  describe('describeTag', () => {
    it('should GET from /api/tags/describe/:tag', () => {
      const mockDesc: TagDescription = {
        tag: 'NCMS000',
        category: 'Nombre',
        description: 'Nombre comun masculino singular',
        full_description: 'Nombre comun masculino singular sin articulo',
      };

      service.describeTag('NCMS000').subscribe((res) => {
        expect(res).toEqual(mockDesc);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/tags/describe/NCMS000`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDesc);
    });
  });

  describe('getCategories', () => {
    it('should GET from /api/tags/categories', () => {
      const mockCategories: { categories: EaglesCategory[] } = {
        categories: [
          { code: 'N', name: 'Nombre', subcategories: [{ code: 'NC', name: 'Comun' }] },
          { code: 'V', name: 'Verbo', subcategories: [{ code: 'VM', name: 'Principal' }] },
        ],
      };

      service.getCategories().subscribe((res) => {
        expect(res.categories.length).toBe(2);
        expect(res.categories[0].code).toBe('N');
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/tags/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);
    });
  });

  describe('describeBatch', () => {
    it('should POST to /api/tags/describe-batch with an array of tags', () => {
      const tags = ['NCMS000', 'VMIP3S0'];
      const mockResponse = {
        descriptions: [
          { tag: 'NCMS000', category: 'Nombre', description: 'Nombre comun', full_description: '' },
          { tag: 'VMIP3S0', category: 'Verbo', description: 'Verbo principal', full_description: '' },
        ],
      };

      service.describeBatch(tags).subscribe((res) => {
        expect(res.descriptions.length).toBe(2);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/tags/describe-batch`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(tags);
      req.flush(mockResponse);
    });
  });

  // ── Exportacion ───────────────────────────────────────

  describe('downloadEmissionExcel', () => {
    it('should return the correct URL with default topN', () => {
      const url = service.downloadEmissionExcel();
      expect(url).toBe(`${baseUrl}/api/exports/emission/excel?top_n=30`);
    });

    it('should return the correct URL with custom topN', () => {
      const url = service.downloadEmissionExcel(50);
      expect(url).toBe(`${baseUrl}/api/exports/emission/excel?top_n=50`);
    });
  });

  describe('downloadTransitionExcel', () => {
    it('should return the correct URL', () => {
      const url = service.downloadTransitionExcel();
      expect(url).toBe(`${baseUrl}/api/exports/transition/excel`);
    });
  });

  describe('downloadViterbiExcel', () => {
    it('should POST to /api/exports/viterbi/excel and return a Blob', () => {
      const sentence = 'El gato duerme.';
      const mockBlob = new Blob(['fake excel'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      service.downloadViterbiExcel(sentence).subscribe((blob) => {
        expect(blob).toBeTruthy();
        expect(blob.size).toBeGreaterThan(0);
      });

      const req = httpTesting.expectOne(`${baseUrl}/api/exports/viterbi/excel`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ sentence });
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('downloadNotebook', () => {
    it('should return the correct URL', () => {
      const url = service.downloadNotebook();
      expect(url).toBe(`${baseUrl}/api/exports/notebook`);
    });
  });

  describe('downloadZip', () => {
    it('should return the correct URL', () => {
      const url = service.downloadZip();
      expect(url).toBe(`${baseUrl}/api/exports/zip`);
    });
  });
});
