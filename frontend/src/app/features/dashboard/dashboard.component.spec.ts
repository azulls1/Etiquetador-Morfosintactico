import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../core/services/api.service';
import { CorpusStats } from '../../core/models/corpus.model';
import { environment } from '../../../environments/environment';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let httpTesting: HttpTestingController;

  const mockStats: CorpusStats = {
    total_tokens: 50000,
    total_sentences: 2000,
    total_documents: 10,
    unique_tags: 85,
    unique_words: 12000,
    processed_files: 10,
    is_loaded: true,
  };

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCorpusStats']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    // Flush any outstanding health-check request from the real HttpClient
    httpTesting.match(() => true);
  });

  it('should create the component', () => {
    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: (observer: any) => { observer.error({}); return { unsubscribe: () => {} }; },
    } as any);
    createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should start with loading state', () => {
    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: () => ({ unsubscribe: () => {} }),
    } as any);
    createComponent();
    expect(component.loadingStats).toBeTrue();
    expect(component.loadingHealth).toBeTrue();
  });

  it('should call ApiService.getCorpusStats on init', () => {
    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: (observer: any) => { observer.error({}); return { unsubscribe: () => {} }; },
    } as any);
    createComponent();
    fixture.detectChanges();
    expect(apiServiceSpy.getCorpusStats).toHaveBeenCalledTimes(1);
  });

  it('should set stats and corpusLoaded when API returns data', () => {
    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: (observer: any) => {
        observer.next(mockStats);
        return { unsubscribe: () => {} };
      },
    } as any);

    createComponent();
    fixture.detectChanges();

    expect(component.stats).toEqual(mockStats);
    expect(component.corpusLoaded).toBeTrue();
    expect(component.modelTrained).toBeTrue();
    expect(component.loadingStats).toBeFalse();
  });

  it('should set modelTrained to false when tokens or tags are zero', () => {
    const emptyStats: CorpusStats = {
      ...mockStats,
      total_tokens: 0,
      unique_tags: 0,
      is_loaded: true,
    };

    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: (observer: any) => {
        observer.next(emptyStats);
        return { unsubscribe: () => {} };
      },
    } as any);

    createComponent();
    fixture.detectChanges();

    expect(component.corpusLoaded).toBeTrue();
    expect(component.modelTrained).toBeFalse();
  });

  it('should handle API errors gracefully', () => {
    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: (observer: any) => {
        observer.error({ status: 500 });
        return { unsubscribe: () => {} };
      },
    } as any);

    createComponent();
    fixture.detectChanges();

    expect(component.stats).toBeNull();
    expect(component.corpusLoaded).toBeFalse();
    expect(component.modelTrained).toBeFalse();
    expect(component.loadingStats).toBeFalse();
  });

  it('should update deliverables availability when model is trained', () => {
    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: (observer: any) => {
        observer.next(mockStats);
        return { unsubscribe: () => {} };
      },
    } as any);

    createComponent();
    fixture.detectChanges();

    // When modelTrained and corpusLoaded are both true, all deliverables should be available
    expect(component.deliverables[0].available).toBeTrue();
    expect(component.deliverables[1].available).toBeTrue();
    expect(component.deliverables[2].available).toBeTrue();
    expect(component.deliverables[3].available).toBeTrue();
    expect(component.deliverables[4].available).toBeTrue();
    expect(component.deliverables[5].available).toBeTrue();
  });

  it('should have correct initial deliverables structure', () => {
    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: (observer: any) => { observer.error({}); return { unsubscribe: () => {} }; },
    } as any);
    createComponent();
    expect(component.deliverables.length).toBe(6);
    // Before any API calls, all should be not available (default)
    for (const item of component.deliverables) {
      expect(item.available).toBeFalse();
    }
  });

  it('should have 4 workflow steps', () => {
    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: (observer: any) => { observer.error({}); return { unsubscribe: () => {} }; },
    } as any);
    createComponent();
    expect(component.workflowSteps.length).toBe(4);
    expect(component.workflowSteps[0].title).toBe('Cargar Corpus');
    expect(component.workflowSteps[3].title).toBe('Exportar Resultados');
  });

  it('should display the loading spinner while stats are loading', () => {
    apiServiceSpy.getCorpusStats.and.returnValue({
      subscribe: () => ({ unsubscribe: () => {} }),
    } as any);

    createComponent();
    component.loadingStats = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinner = compiled.querySelector('app-loading-spinner');
    expect(spinner).toBeTruthy();
  });
});
