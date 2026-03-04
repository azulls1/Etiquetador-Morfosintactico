import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  template: `
    @if (loading) {
      <div class="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
        <div class="w-12 h-12 border-4 border-[#2F5496]/30 border-t-[#2F5496] rounded-full animate-spin" aria-hidden="true"></div>
        <span class="sr-only">Cargando...</span>
        @if (message) {
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">{{ message }}</p>
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
  `],
})
export class LoadingSpinnerComponent {
  @Input() loading = true;
  @Input() message = '';
}
