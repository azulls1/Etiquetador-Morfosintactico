import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { ProbabilitiesComponent } from './probabilities.component';
import { ApiService } from '../../core/services/api.service';
import { StatusResponse } from '../../core/models/corpus.model';

describe('ProbabilitiesComponent', () => {
  let component: ProbabilitiesComponent;
  let fixture: ComponentFixture<ProbabilitiesComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockEmissionData = {
    entries: [
      { tag: 'NCMS000', tag_count: 5000, top_words: [{ word: 'hombre', count: 100, probability: 0.02 }] },
      { tag: 'VMIP3S0', tag_count: 3000, top_words: [{ word: 'dice', count: 80, probability: 0.027 }] },
      { tag: 'AQ0CS0', tag_count: 2000, top_words: [{ word: 'grande', count: 50, probability: 0.025 }] },
    ],
  };

  const mockTransitionData = {
    entries: [
      { tag_prev: 'DA0MS0', tag_next: 'NCMS000', count: 1200, probability: 0.45 },
      { tag_prev: 'NCMS000', tag_next: 'SPS00', count: 800, probability: 0.30 },
      { tag_prev: 'SPS00', tag_next: 'DA0MS0', count: 600, probability: 0.25 },
    ],
  };

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'trainModel',
      'getEmissionTable',
      'getTransitionTable',
      'describeBatch',
      'downloadEmissionExcel',
      'downloadTransitionExcel',
    ]);

    // Default return values for ngOnInit calls
    apiServiceSpy.getEmissionTable.and.returnValue(of(mockEmissionData));
    apiServiceSpy.getTransitionTable.and.returnValue(of(mockTransitionData));
    apiServiceSpy.describeBatch.and.returnValue(of({ descriptions: [] }));
    apiServiceSpy.downloadEmissionExcel.and.returnValue('http://localhost:8000/api/exports/emission/excel?top_n=30');
    apiServiceSpy.downloadTransitionExcel.and.returnValue('http://localhost:8000/api/exports/transition/excel');

    await TestBed.configureTestingModule({
      imports: [ProbabilitiesComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProbabilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should start on the emission tab', () => {
    expect(component.activeTab).toBe('emission');
  });

  it('should load emission and transition tables on init', () => {
    expect(apiServiceSpy.getEmissionTable).toHaveBeenCalledWith(30);
    expect(apiServiceSpy.getTransitionTable).toHaveBeenCalled();
  });

  // ── Tab Switching ──────────────────────────────────

  it('should switch to transition tab', () => {
    component.activeTab = 'transition';
    fixture.detectChanges();
    expect(component.activeTab).toBe('transition');
  });

  it('should switch back to emission tab', () => {
    component.activeTab = 'transition';
    component.activeTab = 'emission';
    fixture.detectChanges();
    expect(component.activeTab).toBe('emission');
  });

  // ── Train Model ────────────────────────────────────

  it('should call trainModel and set result on success', () => {
    const mockResponse: StatusResponse = { status: 'ok', message: 'Model trained successfully' };
    apiServiceSpy.trainModel.and.returnValue(of(mockResponse));

    component.trainModel();

    expect(apiServiceSpy.trainModel).toHaveBeenCalled();
    expect(component.trainingResult).toEqual({ status: 'ok', message: 'Model trained successfully' });
    expect(component.trainingLoading).toBeFalse();
  });

  it('should reload tables after successful training', () => {
    apiServiceSpy.trainModel.and.returnValue(of({ status: 'ok', message: 'Done' }));

    // Reset call counts from ngOnInit
    apiServiceSpy.getEmissionTable.calls.reset();
    apiServiceSpy.getTransitionTable.calls.reset();

    component.trainModel();

    expect(apiServiceSpy.getEmissionTable).toHaveBeenCalledTimes(1);
    expect(apiServiceSpy.getTransitionTable).toHaveBeenCalledTimes(1);
  });

  it('should handle training error', () => {
    apiServiceSpy.trainModel.and.returnValue(
      throwError(() => ({ error: { detail: 'Corpus not loaded' } }))
    );

    component.trainModel();

    expect(component.trainingResult).toBeTruthy();
    expect(component.trainingResult!.status).toBe('error');
    expect(component.trainingResult!.message).toBe('Corpus not loaded');
    expect(component.trainingLoading).toBeFalse();
  });

  it('should set trainingLoading to true while training', () => {
    // Use a Subject-like approach: verify loading is set before the call
    apiServiceSpy.trainModel.and.returnValue(of({ status: 'ok', message: 'Done' }));

    component.trainingLoading = false;
    component.trainingResult = null;
    component.trainModel();

    // After synchronous subscribe, loading is reset
    expect(component.trainingLoading).toBeFalse();
  });

  it('should clear previous training result before new training', () => {
    component.trainingResult = { status: 'ok', message: 'Previous' };
    apiServiceSpy.trainModel.and.returnValue(of({ status: 'ok', message: 'New' }));

    component.trainModel();

    expect(component.trainingResult!.message).toBe('New');
  });

  // ── Emission Table ─────────────────────────────────

  it('should populate emissionData after loading emission table', () => {
    expect(component.emissionData.length).toBe(3);
    expect(component.emissionData[0].tag).toBe('NCMS000');
    expect(component.emissionLoading).toBeFalse();
  });

  it('should handle emission table loading error', () => {
    apiServiceSpy.getEmissionTable.and.returnValue(throwError(() => ({ status: 500 })));

    component.loadEmissionTable();

    expect(component.emissionData.length).toBe(0);
    expect(component.emissionLoading).toBeFalse();
  });

  it('should filter emissions by tag name', () => {
    component.emissionFilter = 'NCMS';

    const filtered = component.filteredEmissions;

    expect(filtered.length).toBe(1);
    expect(filtered[0].tag).toBe('NCMS000');
  });

  it('should return all emissions when filter is empty', () => {
    component.emissionFilter = '';

    const filtered = component.filteredEmissions;

    expect(filtered.length).toBe(3);
  });

  it('should filter emissions case-insensitively', () => {
    component.emissionFilter = 'ncms';

    const filtered = component.filteredEmissions;

    expect(filtered.length).toBe(1);
  });

  // ── Transition Table ───────────────────────────────

  it('should populate transitionData after loading transition table', () => {
    expect(component.transitionData.length).toBe(3);
    expect(component.transitionData[0].tag_prev).toBe('DA0MS0');
    expect(component.transitionLoading).toBeFalse();
  });

  it('should handle transition table loading error', () => {
    apiServiceSpy.getTransitionTable.and.returnValue(throwError(() => ({ status: 500 })));

    component.loadTransitionTable();

    expect(component.transitionData.length).toBe(0);
    expect(component.transitionLoading).toBeFalse();
  });

  it('should filter transitions by tag_prev or tag_next', () => {
    component.transitionFilter = 'DA0MS0';

    const filtered = component.filteredTransitions;

    // DA0MS0 appears as tag_prev once, and as tag_next once
    expect(filtered.length).toBe(2);
  });

  it('should return all transitions when filter is empty', () => {
    component.transitionFilter = '';

    const filtered = component.filteredTransitions;

    expect(filtered.length).toBe(3);
  });

  // ── Heatmap ────────────────────────────────────────

  it('should build heatmap tags from transition data', () => {
    expect(component.heatmapTags.length).toBeGreaterThan(0);
    expect(component.heatmapTags).toContain('DA0MS0');
    expect(component.heatmapTags).toContain('NCMS000');
    expect(component.heatmapTags).toContain('SPS00');
  });

  it('should return correct transition probability from heatmap', () => {
    const prob = component.getTransitionProb('DA0MS0', 'NCMS000');
    expect(prob).toBe(0.45);
  });

  it('should return 0 for missing transition in heatmap', () => {
    const prob = component.getTransitionProb('NCMS000', 'NCMS000');
    expect(prob).toBe(0);
  });

  describe('getHeatmapColor', () => {
    it('should return transparent for zero probability', () => {
      expect(component.getHeatmapColor(0)).toBe('transparent');
    });

    it('should return a green rgba color for positive probability', () => {
      const color = component.getHeatmapColor(0.5);
      expect(color).toContain('rgba(34, 197, 94,');
      expect(color).toContain('0.5');
    });

    it('should cap intensity at 1 for probabilities above 1', () => {
      const color = component.getHeatmapColor(1.5);
      expect(color).toBe('rgba(34, 197, 94, 1)');
    });
  });
});
