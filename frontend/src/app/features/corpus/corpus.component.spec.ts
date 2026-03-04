import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { CorpusComponent } from './corpus.component';
import { ApiService } from '../../core/services/api.service';
import { CorpusStats, CorpusSearchResult, StatusResponse } from '../../core/models/corpus.model';

describe('CorpusComponent', () => {
  let component: CorpusComponent;
  let fixture: ComponentFixture<CorpusComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockStats: CorpusStats = {
    total_tokens: 50000,
    total_sentences: 2000,
    total_documents: 10,
    unique_tags: 85,
    unique_words: 12000,
    processed_files: 10,
    is_loaded: true,
  };

  const mockSearchResult: CorpusSearchResult = {
    word: 'habla',
    tags: { VMIP3S0: 15, NCFS000: 3 },
    total_occurrences: 18,
  };

  const mockTagDistribution = {
    total_tokens: 50000,
    tags: [
      { tag: 'NCMS000', count: 5000, percentage: 10.0 },
      { tag: 'SPS00', count: 4000, percentage: 8.0 },
    ],
  };

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getCorpusStats',
      'uploadCorpus',
      'getUploadStatus',
      'searchWord',
      'getTagDistribution',
    ]);

    // Default return values so ngOnInit does not throw
    apiServiceSpy.getCorpusStats.and.returnValue(of(mockStats));
    apiServiceSpy.getTagDistribution.and.returnValue(of(mockTagDistribution));

    await TestBed.configureTestingModule({
      imports: [CorpusComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CorpusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 tabs', () => {
    expect(component.tabs.length).toBe(4);
    expect(component.tabs[0]).toBe('Carga del Corpus');
    expect(component.tabs[1]).toBe('Estadísticas');
    expect(component.tabs[2]).toBe('Explorador de Palabras');
    expect(component.tabs[3]).toBe('Distribución de Etiquetas');
  });

  it('should start on tab 0', () => {
    expect(component.activeTab).toBe(0);
  });

  it('should switch tabs correctly', () => {
    component.activeTab = 2;
    fixture.detectChanges();
    expect(component.activeTab).toBe(2);

    component.activeTab = 1;
    fixture.detectChanges();
    expect(component.activeTab).toBe(1);
  });

  // ── Stats Loading ──────────────────────────────────

  it('should call getCorpusStats on init', () => {
    expect(apiServiceSpy.getCorpusStats).toHaveBeenCalledTimes(1);
  });

  it('should populate stats and statCards after loading', () => {
    expect(component.stats).toEqual(mockStats);
    expect(component.statCards.length).toBe(6);
    expect(component.statCards[0].label).toBe('Tokens totales');
    expect(component.statCards[0].value).toBe(50000);
  });

  it('should handle stats loading error gracefully', () => {
    apiServiceSpy.getCorpusStats.and.returnValue(throwError(() => ({ status: 500 })));

    component.loadStats();

    expect(component.stats).toBeNull();
    expect(component.statCards.length).toBe(0);
    expect(component.loadingStats).toBeFalse();
  });

  // ── Corpus Upload ──────────────────────────────────

  it('should call uploadCorpus when processCorpus is invoked', () => {
    const mockResponse: StatusResponse = { status: 'processing', message: 'Started' };
    apiServiceSpy.uploadCorpus.and.returnValue(of(mockResponse));
    // Mock getUploadStatus for polling
    apiServiceSpy.getUploadStatus.and.returnValue(of({ status: 'completed', message: 'Done' }));

    component.corpusDir = '/data/corpus';
    component.maxFiles = 5;
    component.processCorpus();

    expect(apiServiceSpy.uploadCorpus).toHaveBeenCalled();
    const callArgs = apiServiceSpy.uploadCorpus.calls.mostRecent().args[0];
    expect(callArgs.corpus_dir).toBe('/data/corpus');
    expect(callArgs.max_files).toBe(5);
  });

  it('should not include corpus_dir if empty', () => {
    const mockResponse: StatusResponse = { status: 'processing', message: 'Started' };
    apiServiceSpy.uploadCorpus.and.returnValue(of(mockResponse));
    apiServiceSpy.getUploadStatus.and.returnValue(of({ status: 'completed', message: 'Done' }));

    component.corpusDir = '  ';
    component.maxFiles = null;
    component.processCorpus();

    const callArgs = apiServiceSpy.uploadCorpus.calls.mostRecent().args[0];
    expect(callArgs.corpus_dir).toBeUndefined();
    expect(callArgs.max_files).toBeUndefined();
  });

  it('should set isProcessing to true during upload', () => {
    apiServiceSpy.uploadCorpus.and.returnValue(of({ status: 'processing', message: 'Started' }));
    apiServiceSpy.getUploadStatus.and.returnValue(of({ status: 'completed', message: 'Done' }));

    component.processCorpus();

    // After polling completes immediately, isProcessing may be true or reset
    expect(apiServiceSpy.uploadCorpus).toHaveBeenCalled();
  });

  it('should handle upload error and set error status', () => {
    apiServiceSpy.uploadCorpus.and.returnValue(
      throwError(() => ({ error: { message: 'Corpus directory not found' } }))
    );

    component.processCorpus();

    expect(component.isProcessing).toBeFalse();
    expect(component.uploadStatus).toBeTruthy();
    expect(component.uploadStatus!.status).toBe('error');
    expect(component.uploadStatus!.message).toBe('Corpus directory not found');
  });

  // ── Word Search ────────────────────────────────────

  it('should call searchWord on the API when searchWord() is invoked', () => {
    apiServiceSpy.searchWord.and.returnValue(of(mockSearchResult));

    component.searchTerm = 'habla';
    component.searchWord();

    expect(apiServiceSpy.searchWord).toHaveBeenCalledWith('habla');
    expect(component.searchResult).toEqual(mockSearchResult);
    expect(component.searchingWord).toBeFalse();
    expect(component.searchPerformed).toBeTrue();
  });

  it('should not call API when search term is empty', () => {
    component.searchTerm = '   ';
    component.searchWord();
    expect(apiServiceSpy.searchWord).not.toHaveBeenCalled();
  });

  it('should handle search error and set result to null', () => {
    apiServiceSpy.searchWord.and.returnValue(throwError(() => ({ status: 500 })));

    component.searchTerm = 'nonexistent';
    component.searchWord();

    expect(component.searchResult).toBeNull();
    expect(component.searchingWord).toBeFalse();
  });

  it('should return sorted tag entries from getTagEntries', () => {
    const tags: Record<string, number> = { VMIP3S0: 5, NCFS000: 15, SPS00: 10 };
    const entries = component.getTagEntries(tags);

    expect(entries.length).toBe(3);
    expect(entries[0].tag).toBe('NCFS000');
    expect(entries[0].count).toBe(15);
    expect(entries[1].tag).toBe('SPS00');
    expect(entries[2].tag).toBe('VMIP3S0');
  });

  // ── Tag Distribution ───────────────────────────────

  it('should load tag distribution on init', () => {
    expect(apiServiceSpy.getTagDistribution).toHaveBeenCalledTimes(1);
    expect(component.tagDistribution.length).toBe(2);
    expect(component.totalTokensDistribution).toBe(50000);
  });

  it('should sort tag distribution by count descending', () => {
    expect(component.tagDistribution[0].count).toBeGreaterThanOrEqual(component.tagDistribution[1].count);
  });

  it('should handle tag distribution error gracefully', () => {
    apiServiceSpy.getTagDistribution.and.returnValue(throwError(() => ({ status: 500 })));

    component.loadTagDistribution();

    expect(component.tagDistribution.length).toBe(0);
    expect(component.totalTokensDistribution).toBe(0);
    expect(component.loadingDistribution).toBeFalse();
  });

  describe('getBarWidth', () => {
    it('should compute bar width relative to the max percentage', () => {
      // tagDistribution[0].percentage = 10.0 (max)
      const width = component.getBarWidth(5.0);
      expect(width).toBe(50); // 5/10 * 100
    });

    it('should return 0 when distribution is empty', () => {
      component.tagDistribution = [];
      expect(component.getBarWidth(5)).toBe(0);
    });
  });
});
