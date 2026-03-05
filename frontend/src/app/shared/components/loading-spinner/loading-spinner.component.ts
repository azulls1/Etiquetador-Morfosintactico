import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  template: `
    @if (loading) {
      <div class="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
        <div class="flex items-center gap-1.5" aria-hidden="true">
          <span class="dot dot-1"></span>
          <span class="dot dot-2"></span>
          <span class="dot dot-3"></span>
        </div>
        <span class="sr-only">Cargando...</span>
        @if (message) {
          <p class="mt-4 text-sm text-slate-400 dark:text-slate-500 font-light">{{ message }}</p>
        }
      </div>
    }
  `,
  styles: [`
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3B82F6;
      animation: pulseDot 1.4s ease-in-out infinite;
    }
    .dot-1 { animation-delay: 0s; }
    .dot-2 { animation-delay: 0.16s; }
    .dot-3 { animation-delay: 0.32s; }

    @keyframes pulseDot {
      0%, 80%, 100% {
        opacity: 0.25;
        transform: scale(0.75);
      }
      40% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() loading = true;
  @Input() message = '';
}
