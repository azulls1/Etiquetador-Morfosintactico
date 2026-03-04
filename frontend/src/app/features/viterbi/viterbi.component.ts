import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ViterbiResult } from '../../core/models/viterbi.model';

@Component({
  selector: 'app-viterbi',
  standalone: true,
  imports: [FormsModule, DecimalPipe, LoadingSpinnerComponent],
  template: `
    <!-- ============================================================ -->
    <!-- ENCABEZADO                                                    -->
    <!-- ============================================================ -->
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-[#2F5496]">Algoritmo de Viterbi</h1>
          <p class="text-sm text-gray-500 mt-1">
            Etiquetado morfosintactico mediante el algoritmo de Viterbi sobre un HMM entrenado con el corpus EAGLES.
          </p>
        </div>
        <!-- Boton exportar Excel -->
        @if (result) {
          <button
            (click)="exportExcel()"
            [disabled]="exporting"
            class="inline-flex items-center gap-2 rounded-lg border border-[#2F5496] px-4 py-2 text-sm font-medium text-[#2F5496] hover:bg-[#2F5496]/10 transition disabled:opacity-50">
            @if (!exporting) {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            @if (exporting) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            }
            {{ exporting ? 'Exportando...' : 'Descargar Excel Viterbi' }}
          </button>
        }
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 1: ENTRADA                                           -->
      <!-- ============================================================ -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Oracion de entrada</h2>

        <!-- Campo de texto -->
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            [(ngModel)]="sentence"
            placeholder="Escribe una oracion..."
            class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                   px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#2F5496]
                   focus:border-transparent outline-none transition"
            (keydown.enter)="tagSentence()" />
          <button
            (click)="tagSentence()"
            [disabled]="loading || !sentence.trim()"
            class="rounded-lg bg-[#2F5496] px-6 py-2.5 text-sm font-semibold text-white shadow
                   hover:bg-[#244078] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
            Etiquetar
          </button>
        </div>

        <!-- Botones de carga rapida -->
        <div class="flex flex-col sm:flex-row gap-2">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 self-center mr-1">Oraciones requeridas:</span>
          @for (s of quickSentences; track $index) {
            <button
              (click)="loadSentence(s)"
              class="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50
                     dark:border-orange-600 dark:bg-orange-900/20
                     px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-300
                     hover:bg-orange-100 dark:hover:bg-orange-900/40 transition">
              <span class="flex items-center justify-center w-5 h-5 rounded-full bg-orange-200 dark:bg-orange-700 text-xs font-bold text-orange-800 dark:text-orange-100">
                {{ $index + 1 }}
              </span>
              {{ s }}
            </button>
          }
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SPINNER                                                      -->
      <!-- ============================================================ -->
      <app-loading-spinner [loading]="loading" message="Ejecutando algoritmo de Viterbi..."></app-loading-spinner>

      <!-- ============================================================ -->
      <!-- ERROR                                                        -->
      <!-- ============================================================ -->
      @if (error) {
        <div class="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-5">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-sm font-semibold text-red-700 dark:text-red-300">Error al etiquetar</p>
              <p class="text-sm text-red-600 dark:text-red-400 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>
      }

      <!-- ============================================================ -->
      <!-- SECCION 2: RESULTADOS (tokens + etiquetas)                   -->
      <!-- ============================================================ -->
      @if (result && !loading) {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Resultado del etiquetado</h2>
            <span class="text-xs font-mono bg-[#2F5496]/10 text-[#2F5496] dark:bg-[#2F5496]/30 dark:text-blue-300 px-3 py-1 rounded-full">
              P(mejor camino) = {{ result.best_path_prob | number:'1.4e+0' }}
            </span>
          </div>

          <!-- Tokens con etiquetas -->
          <div class="flex flex-wrap gap-3">
            @for (token of result.tokens; track $index) {
              <div
                class="flex flex-col items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                <span class="text-base font-semibold text-gray-800 dark:text-gray-100">{{ token }}</span>
                <span
                  class="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide text-white"
                  [style.background-color]="getTagColor(result.tags[$index])">
                  {{ result.tags[$index] }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[130px] leading-tight">
                  {{ result.descriptions[$index] || 'Sin descripcion' }}
                </span>
              </div>
            }
          </div>
        </div>
      }

      <!-- ============================================================ -->
      <!-- SECCION 3: MATRIZ DE VITERBI                                 -->
      <!-- ============================================================ -->
      @if (result && !loading && matrixTags.length > 0) {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Matriz de Viterbi</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Filas = estados (etiquetas) &middot; Columnas = observaciones (tokens).
            Las celdas resaltadas en
            <span class="inline-block w-3 h-3 rounded bg-green-200 dark:bg-green-700 align-middle mx-0.5"></span>
            verde corresponden al camino optimo.
          </p>

          <div class="overflow-x-auto -mx-6 px-6">
            <table class="min-w-full text-xs border-collapse">
              <!-- Cabecera: tokens -->
              <thead>
                <tr>
                  <th class="sticky left-0 z-10 bg-[#2F5496] text-white px-3 py-2 text-left font-semibold rounded-tl-lg">
                    Etiqueta
                  </th>
                  @for (token of result.tokens; track $index) {
                    <th
                      class="bg-[#2F5496] text-white px-3 py-2 text-center font-semibold whitespace-nowrap"
                      [class.rounded-tr-lg]="$index === result.tokens.length - 1">
                      {{ token }}
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (tag of matrixTags; track tag; let rowIdx = $index) {
                  <tr class="border-b border-gray-100 dark:border-gray-700">
                    <!-- Etiqueta fija a la izquierda -->
                    <td class="sticky left-0 z-10 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 font-mono font-bold text-[#2F5496] dark:text-blue-300 whitespace-nowrap border-r border-gray-200 dark:border-gray-600">
                      {{ tag }}
                    </td>
                    <!-- Celdas de la matriz -->
                    @for (token of result.tokens; track $index; let colIdx = $index) {
                      <td
                        class="px-2 py-1.5 text-center font-mono whitespace-nowrap transition-colors"
                        [class]="isOptimalCell(colIdx, tag) ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 font-bold' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'">
                        @if (getMatrixValue(colIdx, tag) !== null) {
                          <span>
                            {{ formatScientific(getMatrixValue(colIdx, tag)!) }}
                          </span>
                        }
                        @if (getMatrixValue(colIdx, tag) === null) {
                          <span class="text-gray-300 dark:text-gray-600">--</span>
                        }
                        <!-- Backpointer -->
                        @if (getBackpointer(colIdx, tag); as bp) {
                          <div
                            class="text-xs mt-0.5"
                            [class]="isOptimalCell(colIdx, tag) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'">
                            &#8592; {{ bp }}
                          </div>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ============================================================ -->
      <!-- SECCION 4: PASO A PASO                                       -->
      <!-- ============================================================ -->
      @if (result && !loading && result.steps && result.steps.length > 0) {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Ejecucion paso a paso</h2>

          <div class="space-y-3">
            @for (step of result.steps; track $index) {
              <div
                class="relative flex items-start gap-4 rounded-xl border p-4 transition"
                [class]="$index === 0 ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20' : ($index === result.steps.length - 1 ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20' : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50')">
                <!-- Numero de paso -->
                <div
                  class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0"
                  [class]="$index === 0 ? 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100' : ($index === result.steps.length - 1 ? 'bg-orange-200 text-orange-800 dark:bg-orange-700 dark:text-orange-100' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200')">
                  {{ $index + 1 }}
                </div>

                <div class="flex-1 min-w-0">
                  <!-- Cabecera del paso -->
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {{ getStepLabel($index) }}
                    </span>
                    <span class="font-mono text-sm text-[#2F5496] dark:text-blue-300 font-bold">
                      &laquo;{{ step.token }}&raquo;
                    </span>
                    <span class="text-gray-400 dark:text-gray-500">&rarr;</span>
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      [style.background-color]="getTagColor(step.tag)">
                      {{ step.tag }}
                    </span>
                  </div>
                  <!-- Descripcion -->
                  <p class="text-xs text-gray-600 dark:text-gray-400">{{ step.description }}</p>
                  <!-- Probabilidad -->
                  <p class="text-xs font-mono text-gray-500 dark:text-gray-500 mt-1">
                    P = {{ formatScientific(step.probability) }}
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ============================================================ -->
      <!-- SECCION 5: COMPARACION                                       -->
      <!-- ============================================================ -->
      @if (resultA && resultB && !loading) {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Comparacion de etiquetados</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Ambas oraciones han sido etiquetadas. Las diferencias de etiqueta se resaltan en
            <span class="inline-block w-3 h-3 rounded bg-orange-200 dark:bg-orange-700 align-middle mx-0.5"></span>
            naranja.
          </p>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Oracion A -->
            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300">Oracion 1</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 italic">&laquo;{{ resultA.sentence }}&raquo;</p>
              <div class="flex flex-wrap gap-2">
                @for (token of resultA.tokens; track $index) {
                  <div
                    class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 border"
                    [class]="isDifferentTag(token, resultA.tags[$index], 'A') ? 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'">
                    <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ token }}</span>
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      [style.background-color]="getTagColor(resultA.tags[$index])">
                      {{ resultA.tags[$index] }}
                    </span>
                  </div>
                }
              </div>
              <p class="text-xs font-mono text-gray-400">
                P = {{ formatScientific(resultA.best_path_prob) }}
              </p>
            </div>

            <!-- Oracion B -->
            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300">Oracion 2</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 italic">&laquo;{{ resultB.sentence }}&raquo;</p>
              <div class="flex flex-wrap gap-2">
                @for (token of resultB.tokens; track $index) {
                  <div
                    class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 border"
                    [class]="isDifferentTag(token, resultB.tags[$index], 'B') ? 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'">
                    <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ token }}</span>
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      [style.background-color]="getTagColor(resultB.tags[$index])">
                      {{ resultB.tags[$index] }}
                    </span>
                  </div>
                }
              </div>
              <p class="text-xs font-mono text-gray-400">
                P = {{ formatScientific(resultB.best_path_prob) }}
              </p>
            </div>
          </div>

          <!-- Tabla resumen de diferencias -->
          @if (comparisonDiffs.length > 0) {
            <div class="mt-4">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Diferencias encontradas</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full text-xs border-collapse">
                  <thead>
                    <tr class="bg-orange-50 dark:bg-orange-900/20">
                      <th class="px-3 py-2 text-left font-semibold text-orange-800 dark:text-orange-300">Token</th>
                      <th class="px-3 py-2 text-center font-semibold text-orange-800 dark:text-orange-300">Etiqueta en Oracion 1</th>
                      <th class="px-3 py-2 text-center font-semibold text-orange-800 dark:text-orange-300">Etiqueta en Oracion 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (diff of comparisonDiffs; track diff.token) {
                      <tr class="border-b border-orange-100 dark:border-orange-800">
                        <td class="px-3 py-1.5 font-medium text-gray-800 dark:text-gray-200">{{ diff.token }}</td>
                        <td class="px-3 py-1.5 text-center">
                          <span class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            [style.background-color]="getTagColor(diff.tagA)">
                            {{ diff.tagA }}
                          </span>
                        </td>
                        <td class="px-3 py-1.5 text-center">
                          <span class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            [style.background-color]="getTagColor(diff.tagB)">
                            {{ diff.tagB }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          @if (comparisonDiffs.length === 0) {
            <div class="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-xs text-green-700 dark:text-green-300 font-medium">
                Ambas oraciones produjeron las mismas etiquetas para los tokens compartidos.
              </span>
            </div>
          }
        </div>
      }

      <!-- ============================================================ -->
      <!-- MENSAJE CUANDO NO HAY RESULTADOS                             -->
      <!-- ============================================================ -->
      @if (!result && !loading && !error) {
        <div class="text-center py-16 text-gray-400 dark:text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p class="text-sm">Introduce una oracion y pulsa <strong>Etiquetar</strong> para ejecutar el algoritmo de Viterbi.</p>
        </div>
      }
    </div>
  `
})
export class ViterbiComponent {

  // ── Estado ────────────────────────────────────────────
  sentence = 'Habla con el enfermo grave de trasplantes.';
  loading = false;
  exporting = false;
  error: string | null = null;

  result: ViterbiResult | null = null;

  // Resultados para comparacion
  resultA: ViterbiResult | null = null;
  resultB: ViterbiResult | null = null;

  // Diferencias entre etiquetados
  comparisonDiffs: { token: string; tagA: string; tagB: string }[] = [];

  // Etiquetas extraidas de la matriz (filas)
  matrixTags: string[] = [];

  // Oraciones requeridas para carga rapida
  readonly quickSentences: string[] = [
    'Habla con el enfermo grave de trasplantes.',
    'El enfermo grave habla de trasplantes.',
  ];

  // Mapa de colores para familias de etiquetas EAGLES
  private readonly tagColorMap: Record<string, string> = {
    A: '#6366f1', // Adjetivo    - indigo
    C: '#8b5cf6', // Conjuncion  - violet
    D: '#0ea5e9', // Determinante - sky
    F: '#94a3b8', // Puntuacion  - slate
    I: '#f43f5e', // Interjec.   - rose
    N: '#2F5496', // Nombre      - UNIR blue
    P: '#14b8a6', // Pronombre   - teal
    R: '#f59e0b', // Adverbio    - amber
    S: '#10b981', // Preposicion - emerald
    V: '#ef4444', // Verbo       - red
    W: '#a855f7', // Fecha       - purple
    Z: '#06b6d4', // Numeral     - cyan
  };

  constructor(private apiService: ApiService) {}

  // ── Acciones ──────────────────────────────────────────

  loadSentence(s: string): void {
    this.sentence = s;
    this.tagSentence();
  }

  tagSentence(): void {
    const trimmed = this.sentence.trim();
    if (!trimmed) return;

    this.loading = true;
    this.error = null;

    this.apiService.tagSentence(trimmed).subscribe({
      next: (res) => {
        this.result = res;
        this.extractMatrixTags();
        this.storeForComparison(res);
        this.buildComparisonDiffs();
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err?.error?.detail ??
          err?.error?.message ??
          err?.message ??
          'Error desconocido al ejecutar Viterbi.';
        this.loading = false;
      },
    });
  }

  exportExcel(): void {
    if (!this.result) return;
    this.exporting = true;

    this.apiService.downloadViterbiExcel(this.result.sentence).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `viterbi_${this.sanitizeFilename(this.result!.sentence)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => {
        this.error = 'No se pudo descargar el archivo Excel.';
        this.exporting = false;
      },
    });
  }

  // ── Matriz de Viterbi ─────────────────────────────────

  /** Extrae las etiquetas (filas) de la matriz Viterbi. */
  private extractMatrixTags(): void {
    if (!this.result?.viterbi_matrix?.length) {
      this.matrixTags = [];
      return;
    }
    const tagSet = new Set<string>();
    for (const col of this.result.viterbi_matrix) {
      if (col) {
        Object.keys(col).forEach((k) => tagSet.add(k));
      }
    }
    this.matrixTags = Array.from(tagSet).sort();
  }

  getMatrixValue(colIdx: number, tag: string): number | null {
    const col = this.result?.viterbi_matrix?.[colIdx];
    if (!col || col[tag] === undefined || col[tag] === null) return null;
    return col[tag] as number;
  }

  getBackpointer(colIdx: number, tag: string): string | null {
    const bp = this.result?.backpointers?.[colIdx];
    if (!bp || bp[tag] === undefined || bp[tag] === null) return null;
    return bp[tag] as string;
  }

  /** Devuelve true si la celda pertenece al camino optimo. */
  isOptimalCell(colIdx: number, tag: string): boolean {
    if (!this.result) return false;
    return this.result.tags[colIdx] === tag;
  }

  // ── Paso a paso ───────────────────────────────────────

  getStepLabel(index: number): string {
    if (!this.result) return '';
    if (index === 0) return 'Inicializacion';
    if (index === this.result.steps.length - 1 && index > 0) return 'Terminacion';
    return `Recursion (t=${index})`;
  }

  // ── Comparacion ───────────────────────────────────────

  private storeForComparison(res: ViterbiResult): void {
    const normalized = res.sentence.trim();
    if (normalized === this.quickSentences[0]) {
      this.resultA = res;
    } else if (normalized === this.quickSentences[1]) {
      this.resultB = res;
    }
  }

  private buildComparisonDiffs(): void {
    this.comparisonDiffs = [];
    if (!this.resultA || !this.resultB) return;

    // Construir mapa token->tag para cada resultado
    const mapA = new Map<string, string>();
    const mapB = new Map<string, string>();
    this.resultA.tokens.forEach((t, i) => mapA.set(t.toLowerCase(), this.resultA!.tags[i]));
    this.resultB.tokens.forEach((t, i) => mapB.set(t.toLowerCase(), this.resultB!.tags[i]));

    // Encontrar tokens compartidos con etiquetas diferentes
    const allTokens = new Set([...mapA.keys(), ...mapB.keys()]);
    for (const token of allTokens) {
      const tagA = mapA.get(token);
      const tagB = mapB.get(token);
      if (tagA && tagB && tagA !== tagB) {
        this.comparisonDiffs.push({ token, tagA, tagB });
      }
    }
  }

  /** Comprueba si un token tiene una etiqueta distinta en la otra oracion. */
  isDifferentTag(token: string, tag: string, source: 'A' | 'B'): boolean {
    const other = source === 'A' ? this.resultB : this.resultA;
    if (!other) return false;
    const lc = token.toLowerCase();
    const idx = other.tokens.findIndex((t) => t.toLowerCase() === lc);
    if (idx === -1) return false;
    return other.tags[idx] !== tag;
  }

  // ── Utilidades ────────────────────────────────────────

  getTagColor(tag: string | null | undefined): string {
    if (!tag || tag.length === 0) return '#9ca3af'; // gray-400 fallback
    const family = tag.charAt(0).toUpperCase();
    return this.tagColorMap[family] ?? '#9ca3af';
  }

  formatScientific(value: number | null | undefined): string {
    if (value === null || value === undefined) return '--';
    if (value === 0) return '0.00e+0';
    return value.toExponential(2);
  }

  private sanitizeFilename(text: string): string {
    return text
      .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 40);
  }
}
