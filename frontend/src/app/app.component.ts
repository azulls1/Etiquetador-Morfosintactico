import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <!-- Skip link (WCAG 2.4.1) -->
      <a href="#main-content" class="skip-link">Saltar al contenido principal</a>

      <!-- Header -->
      <app-navbar (toggleSidebar)="sidebarOpen = !sidebarOpen" />

      <!-- Body: Sidebar + Main -->
      <div class="flex flex-1">
        <app-sidebar [isOpen]="sidebarOpen" />

        <main id="main-content" role="main" aria-label="Contenido principal"
              class="flex-1 overflow-x-hidden min-w-0">
          <div class="max-w-7xl mx-auto px-5 lg:px-8 py-6 lg:py-8 animate-fadeInUp">
            <router-outlet />
          </div>
        </main>
      </div>

      <!-- Footer -->
      <footer class="app-footer px-4 lg:px-6 py-5 text-center">
        <p class="text-xs app-footer-text">
          Etiquetador Morfosintactico HMM &mdash; Procesamiento del Lenguaje Natural &mdash; UNIR 2026
        </p>
        <p class="text-[10px] app-footer-sub mt-0.5">
          Desarrollado por Samael Hernandez &mdash; Maestria en Inteligencia Artificial
        </p>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    app-sidebar { display: flex; flex-shrink: 0; }

    .skip-link {
      position: absolute;
      top: -100%;
      left: 0;
      z-index: 100;
      padding: 0.75rem 1.5rem;
      background: #2F5496;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      border-radius: 0 0 0.5rem 0;
      transition: top 0.2s;
    }
    .skip-link:focus {
      top: 0;
    }

    .app-footer {
      border-top: 1px solid rgba(0, 0, 0, 0.04);
    }
    :host-context(.dark) .app-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.04);
    }
    .app-footer-text { color: #94a3b8; }
    :host-context(.dark) .app-footer-text { color: #475569; }
    .app-footer-sub { color: #cbd5e1; }
    :host-context(.dark) .app-footer-sub { color: #334155; }
  `],
})
export class AppComponent {
  sidebarOpen = false;
}
