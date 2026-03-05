import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface ChecklistItem {
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-exports',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- ═══════════════════════════════════════════════════════════
         ENTREGABLES DE LA ACTIVIDAD
         ═══════════════════════════════════════════════════════════ -->
    <div class="space-y-10">
      <div class="max-w-6xl mx-auto space-y-10">

        <!-- ── Encabezado ─────────────────────────────────────── -->
        <header class="text-center space-y-3">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
               style="background-color: rgba(47,84,150,0.1); color: #2F5496;">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Centro de Descargas
          </div>
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">Entregables de la Actividad</h1>
          <p class="text-gray-500 dark:text-gray-300 max-w-2xl mx-auto text-base lg:text-lg">
            Descarga todos los archivos necesarios para la entrega de la
            <span class="font-semibold text-gray-700 dark:text-gray-200">Actividad 1: Etiquetado Morfosintactico</span>
          </p>
        </header>

        <!-- ── Tarjeta destacada: ZIP ─────────────────────────── -->
        <section>
          <a [href]="zipUrl" download
             class="group relative block rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl"
             style="border-color: #2F5496; background: linear-gradient(135deg, #2F5496 0%, #1e3a6e 100%);">
            <div class="absolute top-4 right-4">
              <span class="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-400 text-white">
                Recomendado
              </span>
            </div>
            <div class="flex flex-col md:flex-row items-center gap-6 p-4 sm:p-8">
              <!-- Icono ZIP -->
              <div class="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center
                          group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h2 class="text-xl font-bold text-white">ZIP - Todos los Entregables (.zip)</h2>
                <p class="mt-1 text-blue-100 text-sm leading-relaxed">
                  Archivo ZIP con todos los entregables: Notebook, tablas de emision y transicion.
                </p>
              </div>
              <div class="flex-shrink-0">
                <span class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all
                             bg-white group-hover:bg-blue-50"
                      style="color: #2F5496;">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Descargar ZIP
                </span>
              </div>
            </div>
          </a>
        </section>

        <!-- ── Tarjetas de descarga individuales ──────────────── -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Jupyter Notebook -->
          <a [href]="notebookUrl" download
             class="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6
                    hover:shadow-lg hover:border-blue-200 transition-all duration-300">
            <div class="absolute top-4 right-4">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase"
                    style="background-color: rgba(47,84,150,0.1); color: #2F5496;">
                Entregable principal
              </span>
            </div>
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center
                          group-hover:scale-110 transition-transform duration-300"
                   style="background-color: rgba(47,84,150,0.08);">
                <svg class="w-7 h-7" style="color: #2F5496;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">Jupyter Notebook (.ipynb)</h3>
                <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                  Notebook completo con codigo Python, resultados y respuestas a las preguntas. Autocontenido y ejecutable.
                </p>
              </div>
            </div>
            <div class="mt-auto pt-5">
              <span class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white
                           group-hover:opacity-90 transition-opacity w-full justify-center"
                    style="background-color: #2F5496;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Descargar Notebook
              </span>
            </div>
          </a>

          <!-- Excel Emision -->
          <a [href]="emissionUrl" download
             class="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6
                    hover:shadow-lg hover:border-blue-200 transition-all duration-300">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-[#2F5496]/8
                          group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-[#2F5496] dark:text-blue-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125M12 15.75c-.621 0-1.125-.504-1.125-1.125m0 0v-1.5c0-.621.504-1.125 1.125-1.125" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">Excel - Tabla de Emision (.xlsx)</h3>
                <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                  Probabilidades de emision P(palabra|etiqueta) calculadas del Wikicorpus.
                </p>
              </div>
            </div>
            <div class="mt-auto pt-5">
              <span class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white
                           bg-[#2F5496] group-hover:bg-[#244075] transition-colors w-full justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Descargar Excel
              </span>
            </div>
          </a>

          <!-- Excel Transicion -->
          <a [href]="transitionUrl" download
             class="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6
                    hover:shadow-lg hover:border-blue-200 transition-all duration-300">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-[#2F5496]/8
                          group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-[#2F5496] dark:text-blue-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">Excel - Tabla de Transicion (.xlsx)</h3>
                <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                  Probabilidades de transicion P(etiqueta_i|etiqueta_{{'{'}}{{'i-1'}}{{'}'}}
                  ) y matriz de transicion.
                </p>
              </div>
            </div>
            <div class="mt-auto pt-5">
              <span class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white
                           bg-[#2F5496] group-hover:bg-[#244075] transition-colors w-full justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Descargar Excel
              </span>
            </div>
          </a>

          <!-- Excel Viterbi (Blob download) -->
          <div class="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6
                      hover:shadow-lg hover:border-purple-200 transition-all duration-300 cursor-pointer"
               (click)="downloadViterbi()">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-purple-50
                          group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-gray-900 dark:text-gray-100">Excel - Matriz de Viterbi (.xlsx)</h3>
                <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                  Matriz de Viterbi para la oracion
                  <em class="text-gray-600 dark:text-gray-300">"Habla con el enfermo grave de trasplantes."</em>
                </p>
              </div>
            </div>
            <div class="mt-auto pt-5">
              <span class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white
                           bg-purple-600 group-hover:bg-purple-700 transition-colors w-full justify-center"
                    [class.opacity-70]="downloadingViterbi">
                @if (!downloadingViterbi) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                } @else {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                }
                {{ downloadingViterbi ? 'Generando...' : 'Descargar Excel' }}
              </span>
            </div>
          </div>

        </section>

        <!-- ── Lista de verificacion ──────────────────────────── -->
        <section class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 style="background-color: rgba(47,84,150,0.08);">
              <svg class="w-5 h-5" style="color: #2F5496;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Lista de Verificacion</h2>
              <p class="text-sm text-gray-500 dark:text-gray-300">Requisitos de la actividad que deben estar incluidos en la entrega</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (item of checklist; track item.label; let i = $index) {
            <label class="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                   [class.bg-green-50]="item.checked"
                   [class.hover:bg-gray-50]="!item.checked">
              <div class="flex-shrink-0 mt-0.5">
                <input type="checkbox"
                       [(ngModel)]="item.checked"
                       class="w-5 h-5 rounded border-gray-300 transition-colors cursor-pointer"
                       style="accent-color: #2F5496;" />
              </div>
              <span class="text-sm leading-relaxed dark:text-gray-300"
                    [class.text-gray-700]="!item.checked"
                    [class.text-green-800]="item.checked"
                    [class.font-medium]="item.checked">
                {{ item.label }}
              </span>
            </label>
            }
          </div>

          <!-- Barra de progreso -->
          <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Progreso de verificacion</span>
              <span class="text-sm font-bold" style="color: #2F5496;">
                {{ checkedCount }} / {{ checklist.length }}
              </span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500 ease-out"
                   [style.width.%]="progressPercent"
                   [style.background-color]="progressPercent === 100 ? '#16a34a' : '#2F5496'">
              </div>
            </div>
            @if (progressPercent === 100) {
            <p class="mt-2 text-sm font-semibold text-green-600 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Todos los requisitos han sido verificados
            </p>
            }
          </div>
        </section>

      </div>
    </div>
  `
})
export class ExportsComponent {
  private api = inject(ApiService);

  /** Direct download URLs */
  notebookUrl   = this.api.downloadNotebook();
  emissionUrl   = this.api.downloadEmissionExcel();
  transitionUrl = this.api.downloadTransitionExcel();
  zipUrl        = this.api.downloadZip();

  /** Viterbi blob download state */
  downloadingViterbi = false;

  private readonly viterbiSentence = 'Habla con el enfermo grave de trasplantes.';

  /** Checklist items */
  checklist: ChecklistItem[] = [
    { label: 'Codigo Python completo y comentado en espanol',             checked: false },
    { label: 'Tablas de probabilidades de emision (Excel)',                checked: false },
    { label: 'Tablas de probabilidades de transicion (Excel)',             checked: false },
    { label: 'Etiquetado de "Habla con el enfermo grave de trasplantes."', checked: false },
    { label: 'Matriz de Viterbi (Excel)',                                  checked: false },
    { label: 'Etiquetado de "El enfermo grave habla de trasplantes."',     checked: false },
    { label: 'Comparacion de ambos etiquetados',                           checked: false },
    { label: 'Respuestas a las 4 preguntas',                               checked: false },
    { label: 'Jupyter Notebook completo',                                   checked: false },
  ];

  /** Computed helpers */
  get checkedCount(): number {
    return this.checklist.filter(i => i.checked).length;
  }

  get progressPercent(): number {
    return Math.round((this.checkedCount / this.checklist.length) * 100);
  }

  /** Download the Viterbi Excel via Blob */
  downloadViterbi(): void {
    if (this.downloadingViterbi) return;
    this.downloadingViterbi = true;

    this.api.downloadViterbiExcel(this.viterbiSentence).subscribe({
      next: (blob: Blob) => {
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url;
        link.download = 'viterbi_resultado.xlsx';
        link.click();
        URL.revokeObjectURL(url);
        this.downloadingViterbi = false;
      },
      error: () => {
        this.downloadingViterbi = false;
      }
    });
  }
}
