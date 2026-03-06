import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Skip link (WCAG 2.4.1) -->
      <a href="#main-content" class="skip-link">Saltar al contenido principal</a>

      <!-- Header -->
      <app-navbar (toggleSidebar)="sidebarOpen = !sidebarOpen" />

      <!-- Body: Sidebar + Main -->
      <div class="flex flex-1">
        <app-sidebar [isOpen]="sidebarOpen" />

        <main id="main-content" role="main" aria-label="Contenido principal"
              class="flex-1 overflow-x-hidden min-w-0">
          <div class="max-w-7xl mx-auto px-5 lg:px-8 py-6 lg:py-8"
               [class.animate-fadeInUp]="contentAnimating"
               (animationend)="contentAnimating = false">
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
          Desarrollado por Adonai Samael Hernandez Mata, Diego Alfonso Najera Ortiz, Mauricio Alberto Alvares Aspeitia &mdash; Maestria en Inteligencia Artificial
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
      background: #04202C;
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
      border-top: 1px solid rgba(4, 32, 44, 0.06);
    }
    .app-footer-text { color: #304040; }
    .app-footer-sub { color: #304040; }
  `],
})
export class AppComponent {
  sidebarOpen = false;
  contentAnimating = true;
}
