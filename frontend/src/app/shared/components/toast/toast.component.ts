import { Component } from '@angular/core';

interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  message: string;
  leaving: boolean;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      @for (toast of toasts; track toast.id) {
        <div class="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium max-w-sm
                    transition-all duration-300 ease-out"
             [class]="toast.leaving
               ? 'opacity-0 translate-x-4'
               : 'opacity-100 translate-x-0'"
             [class.bg-green-50]="toast.type === 'success'"
             [class.border-green-200]="toast.type === 'success'"
             [class.text-green-800]="toast.type === 'success'"
             [class.bg-red-50]="toast.type === 'error'"
             [class.border-red-200]="toast.type === 'error'"
             [class.text-red-800]="toast.type === 'error'">
          @if (toast.type === 'success') {
            <svg class="w-5 h-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } @else {
            <svg class="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          }
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toasts: ToastMessage[] = [];
  private nextId = 0;

  show(type: 'success' | 'error', message: string): void {
    const id = this.nextId++;
    this.toasts.push({ id, type, message, leaving: false });

    setTimeout(() => {
      const t = this.toasts.find(t => t.id === id);
      if (t) t.leaving = true;
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 300);
    }, 4000);
  }
}
