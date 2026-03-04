import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should default loading to true', () => {
    expect(component.loading).toBeTrue();
  });

  it('should default message to empty string', () => {
    expect(component.message).toBe('');
  });

  it('should show the spinner when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusDiv = compiled.querySelector('[role="status"]');
    expect(statusDiv).toBeTruthy();
  });

  it('should hide the spinner when loading is false', () => {
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusDiv = compiled.querySelector('[role="status"]');
    expect(statusDiv).toBeFalsy();
  });

  it('should display the message when provided and loading is true', () => {
    component.loading = true;
    component.message = 'Cargando datos...';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const messageParagraph = compiled.querySelector('p');
    expect(messageParagraph).toBeTruthy();
    expect(messageParagraph!.textContent).toContain('Cargando datos...');
  });

  it('should not display a message paragraph when message is empty', () => {
    component.loading = true;
    component.message = '';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const messageParagraph = compiled.querySelector('p');
    expect(messageParagraph).toBeFalsy();
  });

  it('should have role="status" for accessibility', () => {
    component.loading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusElement = compiled.querySelector('[role="status"]');
    expect(statusElement).toBeTruthy();
  });

  it('should have aria-live="polite" for screen readers', () => {
    component.loading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const statusElement = compiled.querySelector('[aria-live="polite"]');
    expect(statusElement).toBeTruthy();
  });

  it('should contain an sr-only element with "Cargando..." text', () => {
    component.loading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const srOnly = compiled.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly!.textContent).toContain('Cargando...');
  });

  it('should have the animated spinner element with aria-hidden', () => {
    component.loading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const spinnerDiv = compiled.querySelector('[aria-hidden="true"]');
    expect(spinnerDiv).toBeTruthy();
    expect(spinnerDiv!.classList.contains('animate-spin')).toBeTrue();
  });

  it('should not render anything when loading is false', () => {
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.children.length).toBe(0);
  });
});
