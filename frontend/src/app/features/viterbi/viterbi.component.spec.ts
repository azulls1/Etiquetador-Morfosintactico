import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { ViterbiComponent } from './viterbi.component';
import { ApiService } from '../../core/services/api.service';
import { ViterbiResult } from '../../core/models/viterbi.model';

describe('ViterbiComponent', () => {
  let component: ViterbiComponent;
  let fixture: ComponentFixture<ViterbiComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockResult: ViterbiResult = {
    sentence: 'Habla con el enfermo grave de trasplantes.',
    tokens: ['Habla', 'con', 'el', 'enfermo', 'grave', 'de', 'trasplantes', '.'],
    tags: ['VMIP3S0', 'SPS00', 'DA0MS0', 'NCMS000', 'AQ0CS0', 'SPS00', 'NCMP000', 'Fp'],
    descriptions: ['Verbo', 'Preposicion', 'Determinante', 'Nombre', 'Adjetivo', 'Preposicion', 'Nombre', 'Punto'],
    steps: [
      { token: 'Habla', tag: 'VMIP3S0', probability: 0.001, description: 'Inicializacion' },
      { token: 'con', tag: 'SPS00', probability: 0.0005, description: 'Recursion' },
    ],
    viterbi_matrix: [
      { VMIP3S0: 0.001, NCFS000: 0.0001 },
      { SPS00: 0.0005 },
    ],
    backpointers: [
      {},
      { SPS00: 'VMIP3S0' },
    ],
    best_path_prob: 1.23e-15,
  };

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['tagSentence', 'downloadViterbiExcel']);

    await TestBed.configureTestingModule({
      imports: [ViterbiComponent, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViterbiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a default sentence pre-filled', () => {
    expect(component.sentence).toBe('Habla con el enfermo grave de trasplantes.');
  });

  it('should have two quick sentences', () => {
    expect(component.quickSentences.length).toBe(2);
    expect(component.quickSentences[0]).toContain('Habla con el enfermo');
    expect(component.quickSentences[1]).toContain('El enfermo grave habla');
  });

  it('should not call API when sentence is empty', () => {
    component.sentence = '   ';
    component.tagSentence();
    expect(apiServiceSpy.tagSentence).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should call ApiService.tagSentence with trimmed sentence', () => {
    apiServiceSpy.tagSentence.and.returnValue(of(mockResult));

    component.sentence = '  Habla con el enfermo grave de trasplantes.  ';
    component.tagSentence();

    expect(apiServiceSpy.tagSentence).toHaveBeenCalledWith('Habla con el enfermo grave de trasplantes.');
  });

  it('should set result after successful tagging', () => {
    apiServiceSpy.tagSentence.and.returnValue(of(mockResult));

    component.sentence = 'Habla con el enfermo grave de trasplantes.';
    component.tagSentence();

    expect(component.result).toEqual(mockResult);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should extract matrix tags from the viterbi_matrix', () => {
    apiServiceSpy.tagSentence.and.returnValue(of(mockResult));

    component.tagSentence();

    expect(component.matrixTags.length).toBeGreaterThan(0);
    expect(component.matrixTags).toContain('VMIP3S0');
    expect(component.matrixTags).toContain('SPS00');
  });

  it('should set error message on API failure', () => {
    const errorResponse = {
      error: { detail: 'Model not trained yet' },
      status: 400,
    };
    apiServiceSpy.tagSentence.and.returnValue(throwError(() => errorResponse));

    component.sentence = 'Habla con el enfermo grave de trasplantes.';
    component.tagSentence();

    expect(component.error).toBe('Model not trained yet');
    expect(component.loading).toBeFalse();
    expect(component.result).toBeNull();
  });

  it('should handle errors with fallback message', () => {
    apiServiceSpy.tagSentence.and.returnValue(throwError(() => ({})));

    component.sentence = 'test sentence';
    component.tagSentence();

    expect(component.error).toBe('Error desconocido al ejecutar Viterbi.');
  });

  it('should populate input and tag when loadSentence is called', () => {
    apiServiceSpy.tagSentence.and.returnValue(of(mockResult));

    component.loadSentence('El enfermo grave habla de trasplantes.');

    expect(component.sentence).toBe('El enfermo grave habla de trasplantes.');
    expect(apiServiceSpy.tagSentence).toHaveBeenCalledWith('El enfermo grave habla de trasplantes.');
  });

  it('should store resultA when sentence matches quickSentences[0]', () => {
    apiServiceSpy.tagSentence.and.returnValue(of(mockResult));

    component.sentence = 'Habla con el enfermo grave de trasplantes.';
    component.tagSentence();

    expect(component.resultA).toEqual(mockResult);
  });

  it('should store resultB when sentence matches quickSentences[1]', () => {
    const resultB: ViterbiResult = {
      ...mockResult,
      sentence: 'El enfermo grave habla de trasplantes.',
    };
    apiServiceSpy.tagSentence.and.returnValue(of(resultB));

    component.sentence = 'El enfermo grave habla de trasplantes.';
    component.tagSentence();

    expect(component.resultB).toEqual(resultB);
  });

  it('should set loading to true during API call', () => {
    // Do not complete the observable to check loading state
    apiServiceSpy.tagSentence.and.returnValue(of(mockResult));

    component.sentence = 'test';
    component.loading = false;
    component.tagSentence();

    // After the synchronous subscribe completes, loading is false
    expect(component.loading).toBeFalse();
  });

  it('should clear error before tagging', () => {
    component.error = 'Previous error';
    apiServiceSpy.tagSentence.and.returnValue(of(mockResult));

    component.sentence = 'test sentence';
    component.tagSentence();

    expect(component.error).toBeNull();
  });

  describe('getTagColor', () => {
    it('should return the correct color for known tag families', () => {
      expect(component.getTagColor('VMIP3S0')).toBe('#ef4444'); // V = Verbo = red
      expect(component.getTagColor('NCMS000')).toBe('#04202C'); // N = Nombre = forest
      expect(component.getTagColor('AQ0CS0')).toBe('#6366f1');  // A = Adjetivo = indigo
    });

    it('should return gray fallback for null or empty tag', () => {
      expect(component.getTagColor(null)).toBe('#9ca3af');
      expect(component.getTagColor('')).toBe('#9ca3af');
      expect(component.getTagColor(undefined)).toBe('#9ca3af');
    });
  });

  describe('formatScientific', () => {
    it('should format numbers in scientific notation', () => {
      expect(component.formatScientific(0.00123)).toBe('1.23e-3');
    });

    it('should return "--" for null or undefined', () => {
      expect(component.formatScientific(null)).toBe('--');
      expect(component.formatScientific(undefined)).toBe('--');
    });

    it('should return "0.00e+0" for zero', () => {
      expect(component.formatScientific(0)).toBe('0.00e+0');
    });
  });

  describe('getStepLabel', () => {
    it('should return Inicializacion for index 0', () => {
      apiServiceSpy.tagSentence.and.returnValue(of(mockResult));
      component.tagSentence();
      expect(component.getStepLabel(0)).toBe('Inicializacion');
    });

    it('should return Terminacion for the last step', () => {
      apiServiceSpy.tagSentence.and.returnValue(of(mockResult));
      component.tagSentence();
      expect(component.getStepLabel(mockResult.steps.length - 1)).toBe('Terminacion');
    });
  });

  describe('isOptimalCell', () => {
    it('should return true when tag matches the optimal path', () => {
      apiServiceSpy.tagSentence.and.returnValue(of(mockResult));
      component.tagSentence();
      expect(component.isOptimalCell(0, 'VMIP3S0')).toBeTrue();
    });

    it('should return false when tag does not match', () => {
      apiServiceSpy.tagSentence.and.returnValue(of(mockResult));
      component.tagSentence();
      expect(component.isOptimalCell(0, 'NCMS000')).toBeFalse();
    });
  });

  describe('getMatrixValue', () => {
    it('should return the probability for a valid cell', () => {
      apiServiceSpy.tagSentence.and.returnValue(of(mockResult));
      component.tagSentence();
      expect(component.getMatrixValue(0, 'VMIP3S0')).toBe(0.001);
    });

    it('should return null for a missing cell', () => {
      apiServiceSpy.tagSentence.and.returnValue(of(mockResult));
      component.tagSentence();
      expect(component.getMatrixValue(0, 'NONEXISTENT')).toBeNull();
    });
  });
});
