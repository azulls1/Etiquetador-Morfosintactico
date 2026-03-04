import { Component, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { CorpusStats, CorpusSearchResult, TagCount, StatusResponse } from '../../core/models/corpus.model';

@Component({
  selector: 'app-corpus',
  standalone: true,
  imports: [FormsModule, DecimalPipe, LoadingSpinnerComponent],
  template: `
    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- Encabezado                                                  -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold text-[#2F5496] mb-2">Gestión del Corpus</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Carga, explora y analiza el corpus EAGLES para el etiquetado morfosintáctico.
      </p>

      <!-- ═══════════════ Pestañas ═══════════════ -->
      <div class="flex gap-1 mb-6 overflow-x-auto bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        @for (tab of tabs; track $index; let i = $index) {
          <button
            (click)="activeTab = i"
            class="px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200"
            [class]="activeTab === i
              ? 'bg-white dark:bg-gray-700 text-[#2F5496] dark:text-blue-300 shadow-sm font-semibold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
            {{ tab }}
          </button>
        }
      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TAB 0 ── Carga del Corpus                               -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (activeTab === 0) {
      <div class="space-y-6 animate-fadeIn">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-[#2F5496] mb-4 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"/>
            </svg>
            Procesar Corpus
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Directorio del corpus (opcional)
              </label>
              <input
                type="text"
                [(ngModel)]="corpusDir"
                placeholder="Ruta al directorio del corpus..."
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2F5496] focus:border-transparent transition"
                [disabled]="isProcessing" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cantidad máxima de archivos (opcional)
              </label>
              <input
                type="number"
                [(ngModel)]="maxFiles"
                placeholder="Sin límite"
                min="1"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2F5496] focus:border-transparent transition"
                [disabled]="isProcessing" />
            </div>
          </div>

          <button
            (click)="processCorpus()"
            [disabled]="isProcessing"
            class="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2F5496] hover:bg-[#244175] text-white font-medium rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed">
            @if (!isProcessing) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/>
              </svg>
            }
            @if (isProcessing) {
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            }
            {{ isProcessing ? 'Procesando...' : 'Iniciar Procesamiento' }}
          </button>
        </div>

        <!-- Estado del procesamiento -->
        @if (isProcessing || uploadStatus) {
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 class="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Estado del procesamiento</h3>

            <!-- Barra de progreso indeterminada -->
            @if (isProcessing) {
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
                <div class="bg-[#2F5496] h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
              </div>
            }

            @if (uploadStatus) {
              <div class="flex items-start gap-3 p-4 rounded-lg"
                   [class]="uploadStatus.status === 'processing'
                     ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                     : (uploadStatus.status === 'completed' || uploadStatus.status === 'success')
                       ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                       : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'">
                <!-- Icono procesando -->
                @if (uploadStatus.status === 'processing') {
                  <svg class="w-5 h-5 mt-0.5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                }
                <!-- Icono éxito -->
                @if (uploadStatus.status === 'completed' || uploadStatus.status === 'success') {
                  <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                }
                <!-- Icono error -->
                @if (uploadStatus.status === 'error') {
                  <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                }
                <div>
                  <p class="font-medium">{{ uploadStatus.message }}</p>
                  @if (uploadStatus.detail?.current_file) {
                    <p class="text-sm mt-1 opacity-80">
                      Archivo actual: {{ uploadStatus.detail.current_file }}
                    </p>
                  }
                  @if (uploadStatus.detail?.processed_files !== undefined) {
                    <p class="text-sm mt-1 opacity-80">
                      Archivos procesados: {{ uploadStatus.detail.processed_files }}
                      @if (uploadStatus.detail?.total_files) {
                        <span> / {{ uploadStatus.detail.total_files }}</span>
                      }
                    </p>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TAB 1 ── Estadísticas del Corpus                        -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (activeTab === 1) {
      <div class="animate-fadeIn">
        <app-loading-spinner [loading]="loadingStats" message="Cargando estadísticas..."></app-loading-spinner>

        <!-- Estado "no cargado" -->
        @if (!loadingStats && (!stats || !stats.is_loaded)) {
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-10 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
            </svg>
            <h3 class="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">Corpus no cargado</h3>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Procesa el corpus desde la pestaña "Carga del Corpus" para ver las estadísticas.
            </p>
          </div>
        }

        <!-- Tarjetas de estadísticas -->
        @if (!loadingStats && stats && stats.is_loaded) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (card of statCards; track card.label) {
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg bg-[#2F5496]/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-[#2F5496]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="card.icon"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ card.label }}</span>
                </div>
                <p class="text-2xl font-bold text-[#2F5496]">{{ card.value | number }}</p>
              </div>
            }
          </div>
        }
      </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TAB 2 ── Explorador de Palabras                         -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (activeTab === 2) {
      <div class="space-y-6 animate-fadeIn">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-[#2F5496] mb-4 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Buscar Palabra
          </h2>

          <form (ngSubmit)="searchWord()" class="flex gap-3 mb-6">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              name="searchTerm"
              placeholder="Ingrese una palabra para buscar..."
              class="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2F5496] focus:border-transparent transition"
              required />
            <button
              type="submit"
              [disabled]="!searchTerm.trim() || searchingWord"
              class="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2F5496] hover:bg-[#244175] text-white font-medium rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed">
              @if (!searchingWord) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              }
              @if (searchingWord) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              }
              Buscar
            </button>
          </form>

          <app-loading-spinner [loading]="searchingWord" message="Buscando..."></app-loading-spinner>

          <!-- Resultado de búsqueda -->
          @if (searchResult && !searchingWord) {
            <div class="space-y-4">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h3 class="text-md font-semibold text-gray-700 dark:text-gray-300">
                  Resultados para: <span class="text-[#2F5496] font-bold">"{{ searchResult.word }}"</span>
                </h3>
                <span class="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-[#2F5496]/10 text-[#2F5496] rounded-full">
                  {{ searchResult.total_occurrences | number }} ocurrencias totales
                </span>
              </div>

              @if (getTagEntries(searchResult.tags).length === 0) {
                <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm">
                  No se encontraron etiquetas asociadas a esta palabra.
                </div>
              }

              @if (getTagEntries(searchResult.tags).length > 0) {
                <div class="flex flex-wrap gap-2">
                  @for (entry of getTagEntries(searchResult.tags); track entry.tag) {
                    <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2F5496]/10 border border-[#2F5496]/20 rounded-full text-sm transition hover:bg-[#2F5496]/20">
                      <span class="font-mono font-semibold text-[#2F5496]">{{ entry.tag }}</span>
                      <span class="bg-[#2F5496] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
                        {{ entry.count }}
                      </span>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Sin resultados -->
          @if (searchResult === null && searchPerformed && !searchingWord) {
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 text-sm text-center">
              No se encontraron resultados para la búsqueda.
            </div>
          }
        </div>
      </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TAB 3 ── Distribución de Etiquetas                      -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (activeTab === 3) {
      <div class="space-y-6 animate-fadeIn">
        <app-loading-spinner [loading]="loadingDistribution" message="Cargando distribución de etiquetas..."></app-loading-spinner>

        @if (!loadingDistribution && tagDistribution.length > 0) {
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">

            <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
              <h2 class="text-lg font-semibold text-[#2F5496] flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                Distribución de Etiquetas
              </h2>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Total de tokens: <strong class="text-[#2F5496]">{{ totalTokensDistribution | number }}</strong>
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
                  <tr>
                    <th class="px-5 py-3 font-semibold">#</th>
                    <th class="px-5 py-3 font-semibold">Etiqueta</th>
                    <th class="px-5 py-3 font-semibold text-right">Conteo</th>
                    <th class="px-5 py-3 font-semibold text-right">Porcentaje</th>
                    <th class="px-5 py-3 font-semibold min-w-[200px]">Distribución</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  @for (tag of tagDistribution; track tag.tag; let i = $index) {
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td class="px-5 py-3 text-gray-400 dark:text-gray-500 font-mono text-xs">{{ i + 1 }}</td>
                      <td class="px-5 py-3">
                        <span class="inline-block px-2.5 py-1 bg-[#2F5496]/10 text-[#2F5496] font-mono font-semibold text-xs rounded">
                          {{ tag.tag }}
                        </span>
                      </td>
                      <td class="px-5 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                        {{ tag.count | number }}
                      </td>
                      <td class="px-5 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                        {{ tag.percentage | number:'1.2-2' }}%
                      </td>
                      <td class="px-5 py-3">
                        <div class="flex items-center gap-2">
                          <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                            <div class="h-2 rounded-full transition-all duration-500"
                                 [style.width.%]="getBarWidth(tag.percentage)"
                                 [style.background-color]="'#2F5496'">
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (!loadingDistribution && tagDistribution.length === 0) {
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-10 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            <h3 class="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">Sin datos de distribución</h3>
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Procesa el corpus primero para ver la distribución de etiquetas.
            </p>
          </div>
        }
      </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class CorpusComponent implements OnInit, OnDestroy {

  // ── Pestañas ─────────────────────────────────────────
  tabs = ['Carga del Corpus', 'Estadísticas', 'Explorador de Palabras', 'Distribución de Etiquetas'];
  activeTab = 0;

  // ── Carga del corpus ────────────────────────────────
  corpusDir = '';
  maxFiles: number | null = null;
  isProcessing = false;
  uploadStatus: StatusResponse | null = null;
  private pollSub: Subscription | null = null;

  // ── Estadísticas ────────────────────────────────────
  stats: CorpusStats | null = null;
  loadingStats = false;
  statCards: { label: string; value: number; icon: string }[] = [];

  // ── Explorador de palabras ──────────────────────────
  searchTerm = '';
  searchResult: CorpusSearchResult | null | undefined = undefined;
  searchingWord = false;
  searchPerformed = false;

  // ── Distribución de etiquetas ───────────────────────
  tagDistribution: TagCount[] = [];
  totalTokensDistribution = 0;
  loadingDistribution = false;

  constructor(private apiService: ApiService) {}

  // ── Lifecycle ────────────────────────────────────────

  ngOnInit(): void {
    this.loadStats();
    this.loadTagDistribution();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ── Carga del corpus ────────────────────────────────

  processCorpus(): void {
    this.isProcessing = true;
    this.uploadStatus = null;

    const request: any = {};
    if (this.corpusDir.trim()) {
      request.corpus_dir = this.corpusDir.trim();
    }
    if (this.maxFiles !== null && this.maxFiles > 0) {
      request.max_files = this.maxFiles;
    }

    this.apiService.uploadCorpus(request).subscribe({
      next: (res) => {
        this.uploadStatus = res;
        this.startPolling();
      },
      error: (err) => {
        this.isProcessing = false;
        this.uploadStatus = {
          status: 'error',
          message: err.error?.message || err.error?.detail || 'Error al iniciar el procesamiento del corpus.'
        };
      }
    });
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollSub = interval(2000)
      .pipe(
        switchMap(() => this.apiService.getUploadStatus()),
        takeWhile((res) => res.status === 'processing', true)
      )
      .subscribe({
        next: (res) => {
          this.uploadStatus = res;
          if (res.status !== 'processing') {
            this.isProcessing = false;
            this.stopPolling();
            // Recargar estadísticas y distribución tras procesamiento exitoso
            if (res.status === 'completed' || res.status === 'success') {
              this.loadStats();
              this.loadTagDistribution();
            }
          }
        },
        error: () => {
          this.isProcessing = false;
          this.uploadStatus = {
            status: 'error',
            message: 'Se perdió la conexión al verificar el estado del procesamiento.'
          };
          this.stopPolling();
        }
      });
  }

  private stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = null;
    }
  }

  // ── Estadísticas ────────────────────────────────────

  loadStats(): void {
    this.loadingStats = true;
    this.apiService.getCorpusStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.buildStatCards(data);
        this.loadingStats = false;
      },
      error: () => {
        this.stats = null;
        this.statCards = [];
        this.loadingStats = false;
      }
    });
  }

  private buildStatCards(s: CorpusStats): void {
    this.statCards = [
      { label: 'Tokens totales',       value: s.total_tokens,     icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
      { label: 'Oraciones',            value: s.total_sentences,  icon: 'M4 6h16M4 12h16M4 18h7' },
      { label: 'Documentos',           value: s.total_documents,  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { label: 'Etiquetas únicas',     value: s.unique_tags,      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
      { label: 'Palabras únicas',      value: s.unique_words,     icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129' },
      { label: 'Archivos procesados',  value: s.processed_files,  icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z' }
    ];
  }

  // ── Explorador de palabras ──────────────────────────

  searchWord(): void {
    const term = this.searchTerm.trim();
    if (!term) return;

    this.searchingWord = true;
    this.searchPerformed = true;
    this.searchResult = undefined;

    this.apiService.searchWord(term).subscribe({
      next: (result) => {
        this.searchResult = result;
        this.searchingWord = false;
      },
      error: () => {
        this.searchResult = null;
        this.searchingWord = false;
      }
    });
  }

  getTagEntries(tags: Record<string, number>): { tag: string; count: number }[] {
    return Object.entries(tags)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ── Distribución de etiquetas ───────────────────────

  loadTagDistribution(): void {
    this.loadingDistribution = true;
    this.apiService.getTagDistribution().subscribe({
      next: (data) => {
        this.tagDistribution = (data.tags || []).sort((a, b) => b.count - a.count);
        this.totalTokensDistribution = data.total_tokens || 0;
        this.loadingDistribution = false;
      },
      error: () => {
        this.tagDistribution = [];
        this.totalTokensDistribution = 0;
        this.loadingDistribution = false;
      }
    });
  }

  getBarWidth(percentage: number): number {
    if (this.tagDistribution.length === 0) return 0;
    const maxPercentage = this.tagDistribution[0]?.percentage || 1;
    return (percentage / maxPercentage) * 100;
  }
}
