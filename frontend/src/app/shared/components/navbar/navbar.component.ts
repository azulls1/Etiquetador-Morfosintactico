import { Component, EventEmitter, Output, OnInit } from '@angular/core';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  template: `
    <header class="navbar-panel h-14 flex items-center px-4 sticky top-0 z-50" role="banner" aria-label="Barra de navegacion principal">
      <!-- Mobile menu toggle -->
      <button (click)="toggleSidebar.emit()" class="lg:hidden mr-3 p-2 rounded-xl navbar-btn-hover transition-all duration-200 active:scale-95" aria-label="Abrir menu de navegacion">
        <svg class="w-[18px] h-[18px] navbar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Logo and title -->
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center navbar-logo">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
          </svg>
        </div>
        <div class="hidden sm:block">
          <h1 class="text-sm font-semibold navbar-title leading-tight tracking-[-0.01em]">Etiquetador Morfosintactico</h1>
          <p class="text-[11px] navbar-subtitle font-normal">HMM Bigrama + Viterbi</p>
        </div>
      </div>

      <div class="flex-1"></div>

      <!-- Dark mode toggle -->
      <button (click)="toggleDarkMode()"
              class="p-2 rounded-xl navbar-btn-hover transition-all duration-200 active:scale-90"
              [attr.aria-label]="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
              [title]="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
              role="switch"
              [attr.aria-checked]="isDark">
        <div class="dark-toggle-icon" [class.is-dark]="isDark">
          @if (!isDark) {
            <svg class="w-[18px] h-[18px]" style="color: #94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          }
          @if (isDark) {
            <svg class="w-[18px] h-[18px]" style="color: #fbbf24;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
            </svg>
          }
        </div>
      </button>

      <!-- User info -->
      <div class="hidden md:flex items-center gap-2 ml-2 pl-2 navbar-user-divider">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0 navbar-logo">
          SH
        </div>
        <div class="hidden lg:block">
          <p class="text-xs font-medium navbar-user-name leading-tight">Samael Hernandez</p>
          <p class="text-[10px] navbar-user-role leading-tight">UNIR 2026</p>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-panel {
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid transparent;
      border-image: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.15), transparent) 1;
    }
    :host-context(.dark) .navbar-panel {
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-image: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.1), transparent) 1;
    }

    .navbar-logo {
      background: linear-gradient(135deg, #2F5496, #3B82F6);
    }

    .navbar-title { color: #1e293b; }
    :host-context(.dark) .navbar-title { color: #f1f5f9; }

    .navbar-subtitle { color: #94a3b8; }
    :host-context(.dark) .navbar-subtitle { color: #cbd5e1; }

    .navbar-icon { color: #64748b; }
    :host-context(.dark) .navbar-icon { color: #94a3b8; }

    .navbar-btn-hover:hover { background: rgba(0, 0, 0, 0.04); }
    :host-context(.dark) .navbar-btn-hover:hover { background: rgba(255, 255, 255, 0.06); }

    .navbar-user-divider {
      border-left: 1px solid rgba(0, 0, 0, 0.06);
    }
    :host-context(.dark) .navbar-user-divider {
      border-left: 1px solid rgba(255, 255, 255, 0.06);
    }

    .navbar-user-name { color: #334155; }
    :host-context(.dark) .navbar-user-name { color: #e2e8f0; }

    .navbar-user-role { color: #94a3b8; }
    :host-context(.dark) .navbar-user-role { color: #cbd5e1; }

    /* Dark mode toggle animation */
    .dark-toggle-icon {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
    }
    .dark-toggle-icon.is-dark {
      transform: rotate(180deg) scale(1.05);
    }
  `],
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  isDark = false;

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDark = true;
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    }
  }

  toggleDarkMode(): void {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark', this.isDark);
    document.documentElement.classList.toggle('dark', this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }
}
