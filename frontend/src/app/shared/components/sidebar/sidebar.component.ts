import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <aside
      role="navigation"
      aria-label="Menu lateral"
      class="sidebar-panel fixed lg:static inset-y-0 left-0 z-40 w-60 transform transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col"
      [class.-translate-x-full]="!isOpen"
      [class.translate-x-0]="isOpen">

      <!-- Navigation -->
      <nav aria-label="Navegación principal" class="flex-1 px-3 py-5 overflow-y-auto mt-14 lg:mt-0">
        @for (group of navGroups; track group.title; let groupIdx = $index) {
          <div class="px-3 mb-2" [class.mt-6]="groupIdx > 0">
            <span class="text-[10px] font-semibold tracking-[0.08em] uppercase sidebar-section-text">{{ group.title }}</span>
          </div>

          <ul class="space-y-0.5 mb-1">
            @for (item of group.items; track item.route) {
              <li>
                <a [routerLink]="item.route"
                   routerLinkActive="sidebar-active"
                   [routerLinkActiveOptions]="{exact: item.route === '/'}"
                   class="sidebar-link flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-normal transition-all duration-200 group relative">
                  <svg class="w-4 h-4 sidebar-icon transition-all duration-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.icon"/>
                  </svg>
                  <span class="sidebar-label">{{ item.label }}</span>
                </a>
              </li>
            }
          </ul>
        }
      </nav>
    </aside>

    <!-- Overlay for mobile -->
    @if (isOpen) {
      <div class="fixed inset-0 z-30 lg:hidden sidebar-overlay" (click)="isOpen = false"></div>
    }
  `,
  styles: [`
    .sidebar-panel {
      background: rgba(250, 251, 252, 0.8);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-right: 1px solid rgba(0, 0, 0, 0.04);
    }

    .sidebar-section-text { color: #5B7065; }

    .sidebar-link {
      color: #5B7065;
      transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    }
    .sidebar-link:hover {
      background: rgba(4, 32, 44, 0.04);
      color: #04202C;
      transform: translateX(2px);
    }

    .sidebar-icon { color: #304040; }

    /* Active state — forest highlight */
    .sidebar-link.sidebar-active {
      background: rgba(4, 32, 44, 0.08);
      color: #04202C;
      font-weight: 500;
    }
    .sidebar-link.sidebar-active .sidebar-icon {
      color: #04202C !important;
    }

    /* Hover icon */
    .sidebar-link:hover:not(.sidebar-active) .sidebar-icon { color: #304040; }

    .sidebar-overlay {
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
  `],
})
export class SidebarComponent {
  @Input() isOpen = false;

  navGroups: NavGroup[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', route: '/' },
        { label: 'Corpus', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', route: '/corpus' },
        { label: 'Probabilidades', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', route: '/probabilities' },
      ],
    },
    {
      title: 'Herramientas',
      items: [
        { label: 'Viterbi', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', route: '/viterbi' },
        { label: 'Analisis', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', route: '/analysis' },
      ],
    },
    {
      title: 'Referencia',
      items: [
        { label: 'Etiquetas EAGLES', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z', route: '/eagles' },
        { label: 'Entregables', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/exports' },
        { label: 'Informe', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25', route: '/informe' },
      ],
    },
  ];
}
