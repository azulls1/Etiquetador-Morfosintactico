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
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-8">

      <!-- ═══════════════ Encabezado ═══════════════ -->
      <div>
        <h1 class="text-3xl font-bold text-[#2F5496] dark:text-blue-300 mb-1">Gestión del Corpus</h1>
        <p class="text-gray-500 dark:text-gray-300">
          Carga, explora y analiza el corpus EAGLES para el etiquetado morfosintáctico.
        </p>
      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- SECCIÓN 1 ── Carga del Corpus                           -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-[#2F5496] dark:text-blue-300 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"/>
          </svg>
          Cargar Corpus
        </h2>

        <!-- Zona de arrastrar y soltar -->
        <div
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
          class="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
          [class]="isDragging
            ? 'border-[#2F5496] dark:border-blue-400 bg-[#2F5496]/5 dark:bg-[#2F5496]/10 dark:bg-blue-500/15 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-600 hover:border-[#2F5496] dark:border-blue-400/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'">

          <input
            #fileInput
            type="file"
            (change)="onFilesSelected($event)"
            class="hidden"
            multiple
            accept=".txt,.xml"
            webkitdirectory />

          @if (droppedFiles.length === 0) {
            <div class="space-y-2">
              <div class="w-14 h-14 mx-auto rounded-full bg-[#2F5496]/10 dark:bg-blue-500/15 flex items-center justify-center">
                <svg class="w-7 h-7 text-[#2F5496] dark:text-blue-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                </svg>
              </div>
              <p class="text-base font-medium text-gray-700 dark:text-gray-300">
                Arrastra la carpeta del corpus aquí
              </p>
              <p class="text-sm text-gray-400 dark:text-gray-300">
                o haz clic para seleccionar la carpeta con archivos <span class="font-mono text-[#2F5496] dark:text-blue-300">spanishEtiquetado*</span>
              </p>
            </div>
          }

          @if (droppedFiles.length > 0) {
            <div class="space-y-2">
              <div class="w-14 h-14 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg class="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="text-base font-semibold text-green-700 dark:text-green-400">
                {{ droppedFiles.length }} archivos detectados
              </p>
              <p class="text-sm text-gray-400 dark:text-gray-300">
                {{ formatFileSize(totalFileSize) }} en total
              </p>
            </div>
          }
        </div>

        <!-- Archivos detectados -->
        @if (droppedFiles.length > 0) {
          <div class="mt-4 space-y-4">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 max-h-32 overflow-y-auto">
              <div class="flex flex-wrap gap-1.5">
                @for (file of droppedFiles; track file.name) {
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                    {{ file.name }}
                  </span>
                }
              </div>
            </div>

            <div class="flex items-end gap-4">
              <div class="flex-1 max-w-[200px]">
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-300 mb-1">Max. archivos</label>
                <input
                  type="number"
                  [(ngModel)]="maxFiles"
                  [placeholder]="'Todos (' + droppedFiles.length + ')'"
                  [max]="droppedFiles.length"
                  min="1"
                  class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[#2F5496] focus:border-transparent transition"
                  [disabled]="isProcessing" />
              </div>
              <button
                (click)="clearFiles()"
                [disabled]="isProcessing"
                class="px-4 py-2 text-sm text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50">
                Limpiar
              </button>
              <button
                (click)="processDroppedFiles()"
                [disabled]="isProcessing || droppedFiles.length === 0"
                class="inline-flex items-center gap-2 px-5 py-2 bg-[#2F5496] hover:bg-[#244175] text-white text-sm font-medium rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isProcessing) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z"/></svg>
                }
                {{ isProcessing ? 'Procesando...' : 'Procesar Corpus' }}
              </button>
            </div>
          </div>
        }

        <!-- Archivos ya en servidor -->
        @if (droppedFiles.length === 0 && serverFilesCount > 0) {
          <div class="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span class="text-sm text-blue-800 dark:text-blue-300">
              <strong>{{ serverFilesCount }}</strong> archivos del corpus ya disponibles en el servidor.
            </span>
            <button
              (click)="processServerFiles()"
              [disabled]="isProcessing"
              class="px-4 py-1.5 bg-[#2F5496] hover:bg-[#244175] text-white text-sm font-medium rounded-lg shadow transition disabled:opacity-50">
              Procesar
            </button>
          </div>
        }

        <!-- Estado del procesamiento -->
        @if (isProcessing || uploadStatus) {
          <div class="mt-4">
            @if (isProcessing) {
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3 overflow-hidden">
                <div class="bg-[#2F5496] h-1.5 rounded-full progress-bar-indeterminate"></div>
              </div>
            }
            @if (uploadStatus) {
              <div class="flex items-start gap-2.5 p-3 rounded-lg text-sm"
                   [class]="uploadStatus.status === 'running' || uploadStatus.status === 'started'
                     ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                     : (uploadStatus.status === 'completed' || uploadStatus.status === 'success')
                       ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                       : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'">
                @if (uploadStatus.status === 'running' || uploadStatus.status === 'started') {
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                }
                @if (uploadStatus.status === 'completed' || uploadStatus.status === 'success') {
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                }
                @if (uploadStatus.status === 'error') {
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                }
                <div>
                  <p class="font-medium">{{ uploadStatus.message }}</p>
                  @if (uploadStatus.detail?.current_file) {
                    <p class="text-xs mt-0.5 opacity-75">Archivo: {{ uploadStatus.detail.current_file }}</p>
                  }
                  @if (uploadStatus.detail?.progress && uploadStatus.detail?.total) {
                    <p class="text-xs mt-0.5 opacity-75">{{ uploadStatus.detail.progress }} / {{ uploadStatus.detail.total }}</p>
                  }
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- SECCIÓN 2 ── Estadísticas del Corpus                    -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section>
        <h2 class="text-lg font-semibold text-[#2F5496] dark:text-blue-300 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          Estadísticas
        </h2>

        <app-loading-spinner [loading]="loadingStats" message="Cargando estadísticas..."></app-loading-spinner>

        @if (!loadingStats && (!stats || !stats.is_loaded)) {
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8 text-center">
            <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
            </svg>
            <p class="text-sm text-gray-400 dark:text-gray-300">Procesa el corpus para ver las estadísticas.</p>
          </div>
        }

        @if (!loadingStats && stats && stats.is_loaded) {
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            @for (card of statCards; track card.label) {
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-lg bg-[#2F5496]/10 dark:bg-blue-500/15 flex items-center justify-center">
                    <svg class="w-4 h-4 text-[#2F5496] dark:text-blue-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="card.icon"/>
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-300">{{ card.label }}</span>
                </div>
                <p class="text-xl font-bold text-[#2F5496] dark:text-blue-300">{{ card.value | number }}</p>
              </div>
            }
          </div>
        }
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- SECCIÓN 3 ── Explorador de Palabras                     -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-[#2F5496] dark:text-blue-300 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Explorador de Palabras
        </h2>

        <form (ngSubmit)="searchWord()" class="flex gap-3 mb-4">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            name="searchTerm"
            placeholder="Buscar una palabra en el corpus..."
            class="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2F5496] focus:border-transparent transition"
            required />
          <button
            type="submit"
            [disabled]="!searchTerm.trim() || searchingWord"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2F5496] hover:bg-[#244175] text-white font-medium rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed">
            @if (searchingWord) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            }
            Buscar
          </button>
        </form>

        <app-loading-spinner [loading]="searchingWord" message="Buscando..."></app-loading-spinner>

        <!-- Resultado -->
        @if (searchResult && !searchingWord) {
          <div class="space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Resultados para: <span class="text-[#2F5496] dark:text-blue-300 font-bold">"{{ searchResult.word }}"</span>
              </h3>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-[#2F5496]/10 dark:bg-blue-500/15 text-[#2F5496] dark:text-blue-300 rounded-full">
                {{ searchResult.total_occurrences | number }} ocurrencias
              </span>
            </div>

            @if (getTagEntries(searchResult.tags).length > 0) {
              <div class="flex flex-wrap gap-2">
                @for (entry of getTagEntries(searchResult.tags); track entry.tag) {
                  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2F5496]/10 dark:bg-blue-500/15 border border-[#2F5496] dark:border-blue-400/20 rounded-full text-sm transition hover:bg-[#2F5496]/20">
                    <span class="font-mono font-semibold text-[#2F5496] dark:text-blue-300">{{ entry.tag }}</span>
                    <span class="bg-[#2F5496] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
                      {{ entry.count }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm">
                No se encontraron etiquetas asociadas a esta palabra.
              </div>
            }
          </div>
        }

        @if (searchResult === null && searchPerformed && !searchingWord) {
          <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-300 text-sm text-center">
            No se encontraron resultados para la búsqueda.
          </div>
        }
      </section>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- SECCIÓN 4 ── Distribución de Etiquetas                  -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section>
        <app-loading-spinner [loading]="loadingDistribution" message="Cargando distribución..."></app-loading-spinner>

        @if (!loadingDistribution && tagDistribution.length > 0) {
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
              <h2 class="text-lg font-semibold text-[#2F5496] dark:text-blue-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                Distribución de Etiquetas
              </h2>
              <span class="text-sm text-gray-500 dark:text-gray-300">
                Total: <strong class="text-[#2F5496] dark:text-blue-300">{{ totalTokensDistribution | number }}</strong> tokens
              </span>
            </div>

            <div class="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs sticky top-0">
                  <tr>
                    <th class="px-4 py-2.5 font-semibold">#</th>
                    <th class="px-4 py-2.5 font-semibold">Etiqueta</th>
                    <th class="px-4 py-2.5 font-semibold text-right">Conteo</th>
                    <th class="px-4 py-2.5 font-semibold text-right">%</th>
                    <th class="px-4 py-2.5 font-semibold min-w-[150px]">Distribución</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  @for (tag of tagDistribution; track tag.tag; let i = $index) {
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td class="px-4 py-2 text-gray-400 dark:text-gray-300 font-mono text-xs">{{ i + 1 }}</td>
                      <td class="px-4 py-2">
                        <span class="inline-block px-2 py-0.5 bg-[#2F5496]/10 dark:bg-blue-500/15 text-[#2F5496] dark:text-blue-300 font-mono font-semibold text-xs rounded">
                          {{ tag.tag }}
                        </span>
                      </td>
                      <td class="px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                        {{ tag.count | number }}
                      </td>
                      <td class="px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                        {{ tag.percentage | number:'1.2-2' }}%
                      </td>
                      <td class="px-4 py-2">
                        <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                          <div class="h-1.5 rounded-full bg-[#2F5496] transition-all duration-500"
                               [style.width.%]="getBarWidth(tag.percentage)">
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
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8 text-center">
            <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <p class="text-sm text-gray-400 dark:text-gray-300">Procesa el corpus para ver la distribución de etiquetas.</p>
          </div>
        }
      </section>

    </div>
  `,
  styles: [`
    @keyframes indeterminate {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .progress-bar-indeterminate {
      width: 40%;
      animation: indeterminate 1.5s ease-in-out infinite;
    }
  `]
})
export class CorpusComponent implements OnInit, OnDestroy {

  // ── Carga del corpus ────────────────────────────────
  maxFiles: number | null = null;
  isProcessing = false;
  uploadStatus: StatusResponse | null = null;
  private pollSub: Subscription | null = null;

  // ── Drag & Drop ───────────────────────────────────
  isDragging = false;
  droppedFiles: File[] = [];
  totalFileSize = 0;
  serverFilesCount = 0;
  uploadProgress = 0;
  uploadTotal = 0;

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
    this.scanServer();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ── Drag & Drop ────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const items = event.dataTransfer?.items;
    if (!items) return;

    const entries: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }

    this.collectAllFiles(entries).then(files => {
      this.setDroppedFiles(files);
    });
  }

  private async collectAllFiles(entries: any[]): Promise<File[]> {
    const files: File[] = [];
    for (const entry of entries) {
      if (entry.isFile) {
        const file = await new Promise<File>(resolve => {
          entry.file((f: File) => resolve(f));
        });
        files.push(file);
      } else if (entry.isDirectory) {
        const dirEntries = await this.readAllEntries(entry.createReader());
        const subFiles = await this.collectAllFiles(dirEntries);
        files.push(...subFiles);
      }
    }
    return files;
  }

  private readAllEntries(reader: any): Promise<any[]> {
    return new Promise(resolve => {
      const all: any[] = [];
      const readBatch = () => {
        reader.readEntries((entries: any[]) => {
          if (entries.length === 0) {
            resolve(all);
          } else {
            all.push(...entries);
            readBatch();
          }
        });
      };
      readBatch();
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.setDroppedFiles(Array.from(input.files));
  }

  private setDroppedFiles(files: File[]): void {
    this.droppedFiles = files
      .filter(f => f && f.name && f.name.startsWith('spanishEtiquetado'))
      .sort((a, b) => a.name.localeCompare(b.name));
    this.totalFileSize = this.droppedFiles.reduce((sum, f) => sum + f.size, 0);
  }

  clearFiles(): void {
    this.droppedFiles = [];
    this.totalFileSize = 0;
    this.maxFiles = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  scanServer(): void {
    this.apiService.scanCorpusDir().subscribe({
      next: (res) => { this.serverFilesCount = res.detail?.files_count || 0; },
      error: () => { this.serverFilesCount = 0; }
    });
  }

  // ── Procesamiento del corpus ──────────────────────

  async processDroppedFiles(): Promise<void> {
    if (this.droppedFiles.length === 0) return;
    this.isProcessing = true;
    this.uploadStatus = null;
    this.uploadProgress = 0;
    this.uploadTotal = this.droppedFiles.length;

    for (let i = 0; i < this.droppedFiles.length; i++) {
      const file = this.droppedFiles[i];
      this.uploadStatus = {
        status: 'running',
        message: `Subiendo archivo ${i + 1} de ${this.droppedFiles.length}: ${file.name}`,
        detail: { progress: i + 1, total: this.droppedFiles.length }
      };
      this.uploadProgress = i;

      try {
        await this.apiService.uploadCorpusFile(file).toPromise();
      } catch (err: any) {
        this.isProcessing = false;
        this.uploadStatus = {
          status: 'error',
          message: `Error subiendo ${file.name}: ${err.error?.detail || 'Error de conexión'}`
        };
        return;
      }
    }

    this.uploadProgress = this.droppedFiles.length;
    this.uploadStatus = {
      status: 'running',
      message: `${this.droppedFiles.length} archivos subidos. Iniciando procesamiento...`
    };

    const maxFiles = this.maxFiles && this.maxFiles > 0 ? this.maxFiles : undefined;
    this.apiService.processCorpus(maxFiles).subscribe({
      next: (res) => {
        this.uploadStatus = res;
        this.startPolling();
      },
      error: (err) => {
        this.isProcessing = false;
        this.uploadStatus = {
          status: 'error',
          message: err.error?.detail || 'Error al iniciar el procesamiento.'
        };
      }
    });
  }

  processServerFiles(): void {
    this.isProcessing = true;
    this.uploadStatus = null;

    const maxFiles = this.maxFiles && this.maxFiles > 0 ? this.maxFiles : undefined;
    this.apiService.processCorpus(maxFiles).subscribe({
      next: (res) => {
        this.uploadStatus = res;
        this.startPolling();
      },
      error: (err) => {
        this.isProcessing = false;
        this.uploadStatus = {
          status: 'error',
          message: err.error?.detail || 'Error al iniciar el procesamiento.'
        };
      }
    });
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollSub = interval(2000)
      .pipe(
        switchMap(() => this.apiService.getUploadStatus()),
        takeWhile((res) => res.status === 'running' || res.status === 'processing' || res.status === 'started', true)
      )
      .subscribe({
        next: (res) => {
          this.uploadStatus = res;
          if (res.status !== 'running' && res.status !== 'processing' && res.status !== 'started') {
            this.isProcessing = false;
            this.stopPolling();
            if (res.status === 'completed' || res.status === 'success') {
              this.loadStats();
              this.loadTagDistribution();
              this.scanServer();
              this.clearFiles();
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
