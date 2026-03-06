import { Component, EventEmitter, Output } from '@angular/core';
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

      <!-- User info -->
      <div class="hidden md:flex items-center gap-2 ml-2 pl-2 navbar-user-divider">
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0 navbar-logo">
          E4
        </div>
        <div class="hidden lg:block">
          <p class="text-xs font-medium navbar-user-name leading-tight">Equipo PLN</p>
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
      border-image: linear-gradient(to right, transparent, rgba(4, 32, 44, 0.12), transparent) 1;
    }

    .navbar-logo {
      background: linear-gradient(135deg, #04202C, #5B7065);
    }

    .navbar-title { color: #04202C; }
    .navbar-subtitle { color: #5B7065; }
    .navbar-icon { color: #5B7065; }
    .navbar-btn-hover:hover { background: rgba(4, 32, 44, 0.04); }

    .navbar-user-divider {
      border-left: 1px solid rgba(4, 32, 44, 0.08);
    }

    .navbar-user-name { color: #04202C; }
    .navbar-user-role { color: #5B7065; }
  `],
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
}
