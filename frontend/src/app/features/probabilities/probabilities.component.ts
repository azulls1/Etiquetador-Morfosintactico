import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, SlicePipe } from '@angular/common';

import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmissionEntry, TransitionEntry } from '../../core/models/probability.model';

@Component({
  selector: 'app-probabilities',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent, DecimalPipe, SlicePipe],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">

      <!-- Titulo -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-[#2F5496]">Tablas de Probabilidades</h1>
      </div>

      <!-- ========== Entrenar Modelo ========== -->
      <section class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 class="text-lg font-semibold text-[#2F5496] mb-4">Entrenar Modelo HMM</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Calcula las probabilidades de emision y transicion a partir del corpus cargado.
        </p>
        <div class="flex items-center gap-4">
          <button
            (click)="trainModel()"
            [disabled]="trainingLoading"
            class="px-6 py-2.5 bg-[#2F5496] text-white rounded-lg font-medium
                   hover:bg-[#244075] transition disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2">
            @if (trainingLoading) {
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            }
            {{ trainingLoading ? 'Entrenando...' : 'Entrenar Modelo' }}
          </button>
          @if (trainingResult) {
            <span class="text-sm font-medium"
                  [class]="trainingResult.status === 'ok' ? 'text-green-600' : 'text-red-600'">
              {{ trainingResult.message }}
            </span>
          }
        </div>
      </section>

      <!-- ========== Pestanas ========== -->
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          (click)="activeTab = 'emission'"
          class="px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          [class]="activeTab === 'emission'
            ? 'bg-white dark:bg-gray-700 text-[#2F5496] dark:text-blue-300 shadow-sm font-semibold'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
          Probabilidades de Emision
        </button>
        <button
          (click)="activeTab = 'transition'"
          class="px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          [class]="activeTab === 'transition'
            ? 'bg-white dark:bg-gray-700 text-[#2F5496] dark:text-blue-300 shadow-sm font-semibold'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
          Probabilidades de Transicion
        </button>
      </div>

      <!-- ========== Tab: Emision ========== -->
      @if (activeTab === 'emission') {
        <section class="space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <!-- Controles -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div class="flex items-center gap-3">
                <button
                  (click)="loadEmissionTable()"
                  [disabled]="emissionLoading"
                  class="px-4 py-2 bg-[#2F5496] text-white rounded-lg text-sm font-medium
                         hover:bg-[#244075] transition disabled:opacity-50">
                  {{ emissionLoading ? 'Cargando...' : 'Cargar Tabla' }}
                </button>
                <a [href]="apiService.downloadEmissionExcel()"
                   class="px-4 py-2 bg-[#2F5496] text-white rounded-lg text-sm font-medium
                          hover:bg-[#244075] transition inline-flex items-center gap-2"
                   target="_blank">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Descargar Excel
                </a>
              </div>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="emissionFilter"
                  placeholder="Filtrar por etiqueta..."
                  class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-[#2F5496] focus:border-transparent w-64"/>
                <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            <!-- Loading -->
            <app-loading-spinner [loading]="emissionLoading" message="Cargando probabilidades de emision..."></app-loading-spinner>

            <!-- Tabla de emision -->
            @if (!emissionLoading && filteredEmissions.length > 0) {
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-[#2F5496] text-white">
                    <tr>
                      <th class="px-4 py-3 font-medium rounded-tl-lg">Etiqueta</th>
                      <th class="px-4 py-3 font-medium">Descripcion</th>
                      <th class="px-4 py-3 font-medium text-right">Total Etiqueta</th>
                      <th class="px-4 py-3 font-medium rounded-tr-lg">Palabras Principales (palabra : probabilidad)</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entry of filteredEmissions; track entry.tag; let i = $index; let even = $even) {
                      <tr [class]="even ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'">
                        <td class="px-4 py-3 font-mono font-semibold text-[#2F5496]">{{ entry.tag }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                          {{ emissionDescriptions[entry.tag] || '—' }}
                        </td>
                        <td class="px-4 py-3 text-right font-mono">{{ entry.tag_count | number }}</td>
                        <td class="px-4 py-3">
                          <div class="flex flex-wrap gap-1.5">
                            @for (wp of entry.top_words; track wp.word) {
                              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                                           bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
                                    [title]="'Conteo: ' + wp.count">
                                <span class="font-medium">{{ wp.word }}</span>
                                <span class="text-blue-500 dark:text-blue-400">{{ wp.probability | number:'1.4-4' }}</span>
                              </span>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <!-- Sin datos -->
            @if (!emissionLoading && emissionData.length === 0) {
              <div class="text-center py-12 text-gray-400">
                <p>No hay datos de emision. Entrene el modelo primero.</p>
              </div>
            }

            <!-- Sin resultados de filtro -->
            @if (!emissionLoading && emissionData.length > 0 && filteredEmissions.length === 0) {
              <div class="text-center py-8 text-gray-400">
                <p>No se encontraron etiquetas que coincidan con "{{ emissionFilter }}".</p>
              </div>
            }
          </div>
        </section>
      }

      <!-- ========== Tab: Transicion ========== -->
      @if (activeTab === 'transition') {
        <section class="space-y-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <!-- Controles -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div class="flex items-center gap-3">
                <button
                  (click)="loadTransitionTable()"
                  [disabled]="transitionLoading"
                  class="px-4 py-2 bg-[#2F5496] text-white rounded-lg text-sm font-medium
                         hover:bg-[#244075] transition disabled:opacity-50">
                  {{ transitionLoading ? 'Cargando...' : 'Cargar Tabla' }}
                </button>
                <a [href]="apiService.downloadTransitionExcel()"
                   class="px-4 py-2 bg-[#2F5496] text-white rounded-lg text-sm font-medium
                          hover:bg-[#244075] transition inline-flex items-center gap-2"
                   target="_blank">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Descargar Excel
                </a>
              </div>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="transitionFilter"
                  placeholder="Filtrar por etiqueta..."
                  class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-[#2F5496] focus:border-transparent w-64"/>
                <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            <!-- Loading -->
            <app-loading-spinner [loading]="transitionLoading" message="Cargando probabilidades de transicion..."></app-loading-spinner>

            <!-- Mapa de calor -->
            @if (!transitionLoading && heatmapTags.length > 0) {
              <div class="mb-8">
                <h3 class="text-md font-semibold text-[#2F5496] mb-3">
                  Mapa de Calor de Transiciones (Top {{ heatmapTags.length }} etiquetas)
                </h3>
                <div class="overflow-x-auto">
                  <table class="text-xs border-collapse">
                    <thead>
                      <tr>
                        <th class="px-2 py-1 bg-gray-100 dark:bg-gray-700 sticky left-0 z-10 min-w-[60px]
                                   border border-gray-300 dark:border-gray-600 text-[#2F5496] font-semibold">
                          Prev \\ Sig
                        </th>
                        @for (tag of heatmapTags; track tag) {
                          <th class="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                                     text-[#2F5496] font-mono font-semibold text-center min-w-[52px]"
                              [title]="tag">
                            {{ tag.length > 6 ? (tag | slice:0:6) + '..' : tag }}
                          </th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (rowTag of heatmapTags; track rowTag) {
                        <tr>
                          <td class="px-2 py-1 bg-gray-100 dark:bg-gray-700 sticky left-0 z-10
                                     border border-gray-300 dark:border-gray-600 text-[#2F5496] font-mono font-semibold"
                              [title]="rowTag">
                            {{ rowTag.length > 6 ? (rowTag | slice:0:6) + '..' : rowTag }}
                          </td>
                          @for (colTag of heatmapTags; track colTag) {
                            <td class="px-1 py-1 border border-gray-300 dark:border-gray-600 text-center
                                       font-mono cursor-default min-w-[52px]"
                                [style.background-color]="getHeatmapColor(getTransitionProb(rowTag, colTag))"
                                [style.color]="getTransitionProb(rowTag, colTag) > 0.4 ? 'white' : '#1f2937'"
                                [title]="rowTag + ' -> ' + colTag + ': ' + (getTransitionProb(rowTag, colTag) | number:'1.4-4')">
                              {{ getTransitionProb(rowTag, colTag) > 0 ? (getTransitionProb(rowTag, colTag) | number:'1.2-2') : '' }}
                            </td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <div class="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <span>Baja</span>
                  <div class="flex">
                    <div class="w-6 h-4" [style.background-color]="'rgba(34, 197, 94, 0.05)'"></div>
                    <div class="w-6 h-4" [style.background-color]="'rgba(34, 197, 94, 0.2)'"></div>
                    <div class="w-6 h-4" [style.background-color]="'rgba(34, 197, 94, 0.4)'"></div>
                    <div class="w-6 h-4" [style.background-color]="'rgba(34, 197, 94, 0.6)'"></div>
                    <div class="w-6 h-4" [style.background-color]="'rgba(34, 197, 94, 0.8)'"></div>
                    <div class="w-6 h-4" [style.background-color]="'rgba(34, 197, 94, 1.0)'"></div>
                  </div>
                  <span>Alta</span>
                  <span class="ml-2 text-gray-400">Probabilidad de transicion</span>
                </div>
              </div>
            }

            <!-- Tabla de transiciones -->
            @if (!transitionLoading && filteredTransitions.length > 0) {
              <div class="overflow-x-auto">
                <h3 class="text-md font-semibold text-[#2F5496] mb-3">Tabla Detallada de Transiciones</h3>
                <table class="w-full text-sm text-left">
                  <thead class="bg-[#2F5496] text-white">
                    <tr>
                      <th class="px-4 py-3 font-medium rounded-tl-lg">Etiqueta Previa</th>
                      <th class="px-4 py-3 font-medium">Etiqueta Siguiente</th>
                      <th class="px-4 py-3 font-medium text-right">Conteo</th>
                      <th class="px-4 py-3 font-medium text-right rounded-tr-lg">Probabilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entry of filteredTransitions; track entry.tag_prev + entry.tag_next; let i = $index; let even = $even) {
                      <tr [class]="even ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'">
                        <td class="px-4 py-3 font-mono font-semibold text-[#2F5496]">{{ entry.tag_prev }}</td>
                        <td class="px-4 py-3 font-mono font-semibold text-[#2F5496]">{{ entry.tag_next }}</td>
                        <td class="px-4 py-3 text-right font-mono">{{ entry.count | number }}</td>
                        <td class="px-4 py-3 text-right">
                          <div class="flex items-center justify-end gap-2">
                            <div class="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div class="h-full bg-[#2F5496] rounded-full transition-all"
                                   [style.width.%]="entry.probability * 100"></div>
                            </div>
                            <span class="font-mono text-xs w-16 text-right">{{ entry.probability | number:'1.6-6' }}</span>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>

                <!-- Paginacion simple -->
                @if (filteredTransitions.length >= 100) {
                  <div class="mt-4 text-center text-sm text-gray-500">
                    Mostrando las primeras {{ filteredTransitions.length }} transiciones.
                    Use el filtro para buscar etiquetas especificas.
                  </div>
                }
              </div>
            }

            <!-- Sin datos -->
            @if (!transitionLoading && transitionData.length === 0) {
              <div class="text-center py-12 text-gray-400">
                <p>No hay datos de transicion. Entrene el modelo primero.</p>
              </div>
            }

            <!-- Sin resultados de filtro -->
            @if (!transitionLoading && transitionData.length > 0 && filteredTransitions.length === 0) {
              <div class="text-center py-8 text-gray-400">
                <p>No se encontraron transiciones que coincidan con "{{ transitionFilter }}".</p>
              </div>
            }
          </div>
        </section>
      }

    </div>
  `,
})
export class ProbabilitiesComponent implements OnInit {
  activeTab: 'emission' | 'transition' = 'emission';

  // --- Entrenamiento ---
  trainingLoading = false;
  trainingResult: { status: string; message: string } | null = null;

  // --- Emision ---
  emissionLoading = false;
  emissionData: EmissionEntry[] = [];
  emissionFilter = '';
  emissionDescriptions: Record<string, string> = {};

  // --- Transicion ---
  transitionLoading = false;
  transitionData: TransitionEntry[] = [];
  transitionFilter = '';

  // --- Mapa de calor ---
  heatmapTags: string[] = [];
  heatmapMatrix: Record<string, Record<string, number>> = {};

  constructor(public apiService: ApiService) {}

  ngOnInit(): void {
    this.loadEmissionTable();
    this.loadTransitionTable();
  }

  // ── Entrenar modelo ──────────────────────────────────

  trainModel(): void {
    this.trainingLoading = true;
    this.trainingResult = null;
    this.apiService.trainModel().subscribe({
      next: (res) => {
        this.trainingResult = { status: res.status, message: res.message };
        this.trainingLoading = false;
        // Recargar las tablas despues de entrenar
        this.loadEmissionTable();
        this.loadTransitionTable();
      },
      error: (err) => {
        this.trainingResult = {
          status: 'error',
          message: err.error?.detail || err.error?.message || 'Error al entrenar el modelo',
        };
        this.trainingLoading = false;
      },
    });
  }

  // ── Tabla de emision ─────────────────────────────────

  loadEmissionTable(): void {
    this.emissionLoading = true;
    this.apiService.getEmissionTable(30).subscribe({
      next: (data: any) => {
        this.emissionData = data.entries || data || [];
        this.loadEmissionDescriptions();
        this.emissionLoading = false;
      },
      error: () => {
        this.emissionData = [];
        this.emissionLoading = false;
      },
    });
  }

  private loadEmissionDescriptions(): void {
    const tags = this.emissionData.map((e) => e.tag);
    if (tags.length === 0) return;
    this.apiService.describeBatch(tags).subscribe({
      next: (res) => {
        this.emissionDescriptions = {};
        for (const desc of res.descriptions) {
          this.emissionDescriptions[desc.tag] = desc.description;
        }
      },
      error: () => {},
    });
  }

  get filteredEmissions(): EmissionEntry[] {
    if (!this.emissionFilter.trim()) return this.emissionData;
    const filter = this.emissionFilter.trim().toLowerCase();
    return this.emissionData.filter(
      (e) =>
        e.tag.toLowerCase().includes(filter) ||
        (this.emissionDescriptions[e.tag] || '').toLowerCase().includes(filter)
    );
  }

  // ── Tabla de transicion ──────────────────────────────

  loadTransitionTable(): void {
    this.transitionLoading = true;
    this.apiService.getTransitionTable().subscribe({
      next: (data: any) => {
        this.transitionData = data.entries || data || [];
        this.buildHeatmap();
        this.transitionLoading = false;
      },
      error: () => {
        this.transitionData = [];
        this.transitionLoading = false;
      },
    });
  }

  get filteredTransitions(): TransitionEntry[] {
    if (!this.transitionFilter.trim()) return this.transitionData;
    const filter = this.transitionFilter.trim().toLowerCase();
    return this.transitionData.filter(
      (e) =>
        e.tag_prev.toLowerCase().includes(filter) ||
        e.tag_next.toLowerCase().includes(filter)
    );
  }

  // ── Mapa de calor ────────────────────────────────────

  private buildHeatmap(): void {
    // Contar las etiquetas mas frecuentes por apariciones como tag_prev
    const tagCounts: Record<string, number> = {};
    for (const entry of this.transitionData) {
      tagCounts[entry.tag_prev] = (tagCounts[entry.tag_prev] || 0) + entry.count;
      tagCounts[entry.tag_next] = (tagCounts[entry.tag_next] || 0) + entry.count;
    }

    // Top 20 etiquetas
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag]) => tag);

    this.heatmapTags = sortedTags;

    // Construir la matriz
    this.heatmapMatrix = {};
    const tagSet = new Set(sortedTags);
    for (const entry of this.transitionData) {
      if (tagSet.has(entry.tag_prev) && tagSet.has(entry.tag_next)) {
        if (!this.heatmapMatrix[entry.tag_prev]) {
          this.heatmapMatrix[entry.tag_prev] = {};
        }
        this.heatmapMatrix[entry.tag_prev][entry.tag_next] = entry.probability;
      }
    }
  }

  getTransitionProb(tagPrev: string, tagNext: string): number {
    return this.heatmapMatrix[tagPrev]?.[tagNext] || 0;
  }

  getHeatmapColor(probability: number): string {
    if (probability <= 0) return 'transparent';
    // Escala verde: de blanco a verde oscuro
    const intensity = Math.min(probability, 1);
    return `rgba(34, 197, 94, ${intensity})`;
  }
}
