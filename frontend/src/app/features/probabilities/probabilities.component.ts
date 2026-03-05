import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, SlicePipe } from '@angular/common';

import { ApiService } from '../../core/services/api.service';
import { EmissionEntry, TransitionEntry } from '../../core/models/probability.model';

interface ModelStats {
  emission_count: number;
  transition_count: number;
  unique_tags: number;
  vocabulary_size: number;
  smoothing_alpha: number;
}

interface StatCard {
  label: string;
  value: string;
  icon: string;
}

interface SelectedCell {
  rowTag: string;
  colTag: string;
  probability: number;
}

@Component({
  selector: 'app-probabilities',
  standalone: true,
  imports: [FormsModule, DecimalPipe, SlicePipe],
  template: `
    <div class="px-3 py-5">

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TOP BAR ── Header + Train inline                        -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 animate-fadeInUp">
        <div>
          <h1 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Tablas de Probabilidades
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Modelo HMM Bigram — Emision, transicion y mapa de calor
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="trainModel()"
            [disabled]="trainingLoading"
            class="px-4 py-1.5 bg-[#2F5496] text-white rounded-lg font-medium text-xs
                   hover:bg-[#244075] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-1.5 shadow-sm hover:shadow-md whitespace-nowrap">
            @if (trainingLoading) {
              <svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            } @else {
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082"/>
              </svg>
            }
            {{ trainingLoading ? 'Entrenando...' : 'Entrenar Modelo' }}
          </button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TRAINING BANNER (prominent)                              -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (trainingLoading) {
        <div class="mb-4 rounded-xl overflow-hidden animate-fadeInUp">
          <div class="relative bg-gradient-to-r from-[#2F5496] via-[#3B6BC4] to-[#2F5496] px-5 py-4">
            <!-- Animated shimmer -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent training-shimmer"></div>
            <div class="relative flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              </div>
              <div>
                <p class="text-white font-semibold text-sm">Entrenando modelo HMM...</p>
                <p class="text-blue-100/80 text-xs mt-0.5">
                  Calculando probabilidades de emision y transicion. Esto puede tardar unos minutos.
                </p>
              </div>
            </div>
            <!-- Progress bar -->
            <div class="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-white/40 rounded-full training-progress"></div>
            </div>
          </div>
        </div>
      }

      <!-- Training result toast -->
      @if (trainingResult && !trainingLoading) {
        <div class="mb-4 rounded-xl px-4 py-3 flex items-center gap-3 animate-fadeInUp"
             [class]="trainingResult.status === 'completed'
               ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
               : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'">
          @if (trainingResult.status === 'completed') {
            <svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          } @else {
            <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          }
          <p class="text-sm font-medium"
             [class]="trainingResult.status === 'completed'
               ? 'text-emerald-700 dark:text-emerald-300'
               : 'text-red-700 dark:text-red-300'">
            {{ trainingResult.message }}
          </p>
          <button (click)="trainingResult = null" class="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- STATS STRIP                                             -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (modelStats) {
        <div class="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4 stagger-children animate-fadeInUp"
             style="animation-delay: 40ms">
          @for (card of modelStatCards; track card.label) {
            <div class="card-base px-3 py-2.5 animate-fadeInUp">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {{ card.label }}
                </span>
                <span class="w-5 h-5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400
                             flex items-center justify-center">
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="card.icon"/>
                  </svg>
                </span>
              </div>
              <p class="text-lg font-semibold text-slate-800 dark:text-slate-100">{{ card.value }}</p>
            </div>
          }
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TWO-COLUMN ── Emision (left) + Transiciones (right)     -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4 animate-fadeInUp" style="animation-delay: 80ms">

        <!-- ── LEFT: Emision ──────────────────────────────── -->
        <section class="card-base overflow-hidden flex flex-col">
          <!-- Toolbar -->
          <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300 flex items-center gap-1.5 whitespace-nowrap">
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"/>
              </svg>
              Emision
            </h2>
            <div class="flex items-center gap-2">
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="emissionFilter"
                  (ngModelChange)="emissionPage = 0"
                  placeholder="Filtrar..."
                  class="pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-[#2F5496]/30 focus:border-[#2F5496] w-36 transition"/>
                <svg class="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <a [href]="apiService.downloadEmissionExcel()"
                 class="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400
                        border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50
                        dark:hover:bg-gray-700 transition" target="_blank" title="Descargar Excel">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Top tag mini-banner -->
          @if (!emissionLoading && emissionData.length > 0) {
            <div class="px-3 py-2 bg-gradient-to-r from-blue-50/80 to-transparent dark:from-blue-900/10 dark:to-transparent
                        border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[#2F5496] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                {{ emissionData[0].tag.slice(0,2) }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  Top: <span class="font-mono text-[#2F5496] dark:text-blue-300">{{ emissionData[0].tag }}</span>
                  <span class="text-slate-400 font-normal">({{ emissionData[0].tag_count | number }})</span>
                </p>
                <div class="flex gap-1 mt-0.5 flex-wrap">
                  @for (wp of emissionData[0].top_words | slice:0:4; track wp.word) {
                    <span class="px-1.5 py-px text-[10px] rounded bg-white dark:bg-gray-700
                                 border border-gray-200 dark:border-gray-600 text-slate-500 dark:text-slate-400">
                      {{ wp.word }}
                    </span>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Skeleton -->
          @if (emissionLoading) {
            <div class="p-3 space-y-2 flex-1">
              @for (row of skeletonRowsSmall; track row) {
                <div class="flex items-center gap-3 animate-pulse">
                  <div class="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div class="w-20 h-3 bg-gray-100 dark:bg-gray-700/60 rounded"></div>
                  <div class="flex gap-1 ml-auto">
                    <div class="w-12 h-4 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
                    <div class="w-10 h-4 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Emission table -->
          @if (!emissionLoading && filteredEmissions.length > 0) {
            <div class="overflow-x-auto flex-1">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                  <tr>
                    <th class="px-3 py-2 font-semibold text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Etiqueta
                    </th>
                    <th class="px-3 py-2 font-semibold text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Descripcion
                    </th>
                    <th class="px-3 py-2 font-semibold text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Total
                    </th>
                    <th class="px-3 py-2 font-semibold text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Palabras
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                  @for (entry of paginatedEmissions; track entry.tag) {
                    <tr class="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-150">
                      <td class="px-3 py-1.5">
                        <button class="font-mono font-semibold text-[#2F5496] dark:text-blue-300 hover:underline
                                       cursor-pointer bg-transparent border-none p-0 text-sm"
                                (click)="scrollToTag(entry.tag)">
                          {{ entry.tag }}
                        </button>
                      </td>
                      <td class="px-3 py-1.5 text-slate-500 dark:text-slate-400 text-xs max-w-[140px] truncate">
                        {{ emissionDescriptions[entry.tag] || '\u2014' }}
                      </td>
                      <td class="px-3 py-1.5 text-right font-mono text-xs text-slate-600 dark:text-slate-300">
                        {{ entry.tag_count | number }}
                      </td>
                      <td class="px-3 py-1.5">
                        <div class="flex flex-wrap gap-1">
                          @for (wp of entry.top_words | slice:0:6; track wp.word) {
                            <span class="inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-[10px]
                                         border border-blue-200 dark:border-blue-800
                                         bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                                         hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-default"
                                  [title]="'P(' + wp.word + '|' + entry.tag + ') = ' + wp.probability.toFixed(6)">
                              <span class="font-medium">{{ wp.word }}</span>
                              <span class="text-blue-400 dark:text-blue-500">{{ wp.probability | number:'1.3-3' }}</span>
                            </span>
                          }
                          @if (entry.top_words.length > 6) {
                            <span class="text-[10px] text-slate-400">+{{ entry.top_words.length - 6 }}</span>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span class="text-xs text-slate-400 dark:text-slate-500">
                {{ emissionPage * pageSize + 1 }}\u2013{{ emissionPageEnd }} de {{ filteredEmissions.length }}
              </span>
              <div class="flex items-center gap-1">
                <button (click)="emissionPage = emissionPage - 1" [disabled]="emissionPage === 0"
                        class="pagination-btn" [class.pagination-btn-disabled]="emissionPage === 0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                @for (p of emissionPages; track p) {
                  <button (click)="emissionPage = p"
                          class="pagination-num"
                          [class.pagination-num-active]="p === emissionPage">
                    {{ p + 1 }}
                  </button>
                }
                <button (click)="emissionPage = emissionPage + 1" [disabled]="emissionPage >= emissionTotalPages - 1"
                        class="pagination-btn" [class.pagination-btn-disabled]="emissionPage >= emissionTotalPages - 1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          }

          <!-- Empty states -->
          @if (!emissionLoading && emissionData.length === 0) {
            <div class="text-center py-10 px-4 flex-1 flex flex-col items-center justify-center">
              <svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"/>
              </svg>
              <p class="text-xs text-gray-400 dark:text-gray-500">Entrene el modelo primero.</p>
            </div>
          }
          @if (!emissionLoading && emissionData.length > 0 && filteredEmissions.length === 0) {
            <div class="text-center py-10 text-gray-400 dark:text-gray-500 flex-1 flex items-center justify-center">
              <p class="text-xs">Sin coincidencias para "{{ emissionFilter }}".</p>
            </div>
          }
        </section>

        <!-- ── RIGHT: Transiciones ────────────────────────── -->
        <section class="card-base overflow-hidden flex flex-col">
          <!-- Toolbar -->
          <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300 flex items-center gap-1.5 whitespace-nowrap">
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
              </svg>
              Transiciones
            </h2>
            <div class="flex items-center gap-2">
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="transitionFilter"
                  (ngModelChange)="transitionPage = 0"
                  placeholder="Filtrar..."
                  class="pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-[#2F5496]/30 focus:border-[#2F5496] w-36 transition"/>
                <svg class="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <a [href]="apiService.downloadTransitionExcel()"
                 class="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400
                        border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50
                        dark:hover:bg-gray-700 transition" target="_blank" title="Descargar Excel">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Skeleton -->
          @if (transitionLoading) {
            <div class="p-3 space-y-2 flex-1">
              @for (row of skeletonRowsSmall; track row) {
                <div class="flex items-center gap-3 animate-pulse">
                  <div class="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div class="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div class="w-8 h-3 bg-gray-100 dark:bg-gray-700/60 rounded ml-auto"></div>
                  <div class="w-20 h-2 bg-gray-100 dark:bg-gray-700/60 rounded-full"></div>
                </div>
              }
            </div>
          }

          <!-- Transition table -->
          @if (!transitionLoading && filteredTransitions.length > 0) {
            <div class="overflow-x-auto flex-1">
              <table class="w-full text-sm text-left">
                <thead class="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                  <tr>
                    <th class="px-3 py-2 font-semibold text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Previa
                    </th>
                    <th class="px-3 py-2 font-semibold text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Siguiente
                    </th>
                    <th class="px-3 py-2 font-semibold text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Conteo
                    </th>
                    <th class="px-3 py-2 font-semibold text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Probabilidad
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                  @for (entry of paginatedTransitions; track entry.tag_prev + entry.tag_next) {
                    <tr class="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-150"
                        [style.background-color]="highlightedTag && (entry.tag_prev === highlightedTag || entry.tag_next === highlightedTag) ? 'rgba(59, 130, 246, 0.08)' : ''">
                      <td class="px-3 py-1.5 font-mono font-semibold text-[#2F5496] dark:text-blue-300 text-sm">
                        {{ entry.tag_prev }}
                      </td>
                      <td class="px-3 py-1.5 font-mono font-semibold text-[#2F5496] dark:text-blue-300 text-sm">
                        {{ entry.tag_next }}
                      </td>
                      <td class="px-3 py-1.5 text-right font-mono text-xs text-slate-600 dark:text-slate-300">
                        {{ entry.count | number }}
                      </td>
                      <td class="px-3 py-1.5 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <div class="w-20 h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div class="h-full rounded-full bg-gradient-to-r from-[#2F5496] to-[#3B82F6] transition-all duration-300"
                                 [style.width.%]="entry.probability * 100"></div>
                          </div>
                          <span class="font-mono text-[10px] w-14 text-right text-slate-500 dark:text-slate-400">
                            {{ entry.probability | number:'1.6-6' }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="px-3 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span class="text-xs text-slate-400 dark:text-slate-500">
                {{ transitionPage * pageSize + 1 }}\u2013{{ transitionPageEnd }} de {{ filteredTransitions.length | number }}
              </span>
              <div class="flex items-center gap-1">
                <button (click)="transitionPage = transitionPage - 1" [disabled]="transitionPage === 0"
                        class="pagination-btn" [class.pagination-btn-disabled]="transitionPage === 0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                @for (p of transitionVisiblePages; track p) {
                  <button (click)="transitionPage = p"
                          class="pagination-num"
                          [class.pagination-num-active]="p === transitionPage">
                    {{ p + 1 }}
                  </button>
                }
                @if (transitionTotalPages > 7) {
                  <span class="text-xs text-slate-400 px-1">\u2026</span>
                  <button (click)="transitionPage = transitionTotalPages - 1"
                          class="pagination-num"
                          [class.pagination-num-active]="transitionPage === transitionTotalPages - 1">
                    {{ transitionTotalPages }}
                  </button>
                }
                <button (click)="transitionPage = transitionPage + 1" [disabled]="transitionPage >= transitionTotalPages - 1"
                        class="pagination-btn" [class.pagination-btn-disabled]="transitionPage >= transitionTotalPages - 1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          }

          <!-- Empty states -->
          @if (!transitionLoading && transitionData.length === 0) {
            <div class="text-center py-10 px-4 flex-1 flex flex-col items-center justify-center">
              <svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
              </svg>
              <p class="text-xs text-gray-400 dark:text-gray-500">Entrene el modelo primero.</p>
            </div>
          }
          @if (!transitionLoading && transitionData.length > 0 && filteredTransitions.length === 0) {
            <div class="text-center py-10 text-gray-400 dark:text-gray-500 flex-1 flex items-center justify-center">
              <p class="text-xs">Sin coincidencias para "{{ transitionFilter }}".</p>
            </div>
          }
        </section>

      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- HEATMAP ── Hero full width (bottom)                     -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <section class="heatmap-hero mb-0 animate-fadeInUp" style="animation-delay: 140ms" id="heatmap-section">
        <div class="heatmap-container rounded-2xl overflow-hidden">
          <!-- Header bar -->
          <div class="heatmap-toolbar px-4 py-2.5 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-white flex items-center gap-2">
              <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"/>
              </svg>
              Mapa de Calor de Transiciones
              @if (heatmapTags.length > 0) {
                <span class="text-xs font-normal text-blue-200 ml-1">Top {{ heatmapTags.length }}</span>
              }
            </h2>
            @if (selectedCell) {
              <div class="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                <span class="text-sm text-white font-mono">
                  {{ selectedCell.rowTag }}
                  <span class="text-blue-300 mx-1">\u2192</span>
                  {{ selectedCell.colTag }}
                </span>
                <span class="text-xs text-blue-200">
                  P = {{ selectedCell.probability | number:'1.8-8' }}
                </span>
                <button (click)="selectedCell = null"
                        class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/30 transition">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- Skeleton -->
          @if (transitionLoading) {
            <div class="p-4">
              <div class="grid grid-cols-12 gap-[2px] animate-pulse">
                @for (cell of skeletonGrid; track cell) {
                  <div class="aspect-square rounded-[3px] bg-white/5"></div>
                }
              </div>
            </div>
          }

          <!-- Matrix -->
          @if (!transitionLoading && heatmapTags.length > 0) {
            <div class="px-4 pt-1 pb-3 overflow-x-auto">
              <table class="text-xs border-separate w-full" style="border-spacing: 2px;">
                <thead>
                  <tr>
                    <th class="px-2 py-2 sticky left-0 z-10 min-w-[52px] rounded text-[10px] font-semibold heatmap-corner-cell">
                      Prev \\ Sig
                    </th>
                    @for (tag of heatmapTags; track tag; let ci = $index) {
                      <th class="px-1 py-2 text-center min-w-[40px] rounded text-[10px] font-mono font-semibold transition-colors duration-100"
                          [class]="hoveredCol === ci ? 'heatmap-col-active' : 'heatmap-col-idle'"
                          [title]="tag">
                        {{ tag.length > 4 ? (tag | slice:0:4) + '..' : tag }}
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (rowTag of heatmapTags; track rowTag; let ri = $index) {
                    <tr>
                      <td class="px-2 py-1 sticky left-0 z-10 min-w-[52px] rounded text-[10px] font-mono font-semibold transition-colors duration-100"
                          [class]="hoveredRow === ri ? 'heatmap-col-active' : 'heatmap-col-idle'"
                          [title]="rowTag">
                        {{ rowTag.length > 4 ? (rowTag | slice:0:4) + '..' : rowTag }}
                      </td>
                      @for (colTag of heatmapTags; track colTag; let ci = $index) {
                        <td class="text-center font-mono cursor-pointer rounded-[3px] transition-all duration-100"
                            [style.background-color]="getHeatmapColor(getTransitionProb(rowTag, colTag))"
                            [style.color]="getHeatmapTextColor(getTransitionProb(rowTag, colTag))"
                            [style.outline]="hoveredRow === ri && hoveredCol === ci ? '2px solid #60A5FA' : 'none'"
                            [style.outline-offset]="'-1px'"
                            [style.opacity]="(hoveredRow !== null && hoveredRow !== ri && hoveredCol !== ci) ? 0.45 : 1"
                            [style.transform]="hoveredRow === ri && hoveredCol === ci ? 'scale(1.15)' : 'scale(1)'"
                            [title]="rowTag + ' \u2192 ' + colTag + ': ' + (getTransitionProb(rowTag, colTag) | number:'1.6-6')"
                            (mouseenter)="hoveredRow = ri; hoveredCol = ci"
                            (mouseleave)="hoveredRow = null; hoveredCol = null"
                            (click)="selectHeatmapCell(rowTag, colTag, getTransitionProb(rowTag, colTag))">
                          <span class="text-[9px] leading-[26px] font-medium">
                            {{ getTransitionProb(rowTag, colTag) > 0 ? (getTransitionProb(rowTag, colTag) | number:'1.2-2') : '' }}
                          </span>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Legend -->
            <div class="px-4 pb-3 flex items-center gap-2 text-[11px]">
              <span class="font-medium text-blue-200/70">Baja</span>
              <div class="flex gap-px">
                <div class="w-7 h-3 rounded-sm" [style.background-color]="'#1E3A5F'"></div>
                <div class="w-7 h-3 rounded-sm" [style.background-color]="'#1E4D8C'"></div>
                <div class="w-7 h-3 rounded-sm" [style.background-color]="'#2563EB'"></div>
                <div class="w-7 h-3 rounded-sm" [style.background-color]="'#3B82F6'"></div>
                <div class="w-7 h-3 rounded-sm" [style.background-color]="'#60A5FA'"></div>
                <div class="w-7 h-3 rounded-sm" [style.background-color]="'#93C5FD'"></div>
                <div class="w-7 h-3 rounded-sm" [style.background-color]="'#BFDBFE'"></div>
                <div class="w-7 h-3 rounded-sm" [style.background-color]="'#EFF6FF'"></div>
              </div>
              <span class="font-medium text-blue-200/70">Alta</span>
            </div>
          }

          <!-- Empty -->
          @if (!transitionLoading && heatmapTags.length === 0) {
            <div class="text-center py-14 px-4">
              <svg class="w-14 h-14 mx-auto text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"/>
              </svg>
              <p class="text-sm text-white/40">Entrene el modelo para visualizar el mapa de calor.</p>
            </div>
          }
        </div>
      </section>

      <!-- bottom spacer -->
      <div class="h-8"></div>
    </div>
  `,
  styles: [`
    /* ── Card base ──────────────────────────────────── */
    .card-base {
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.04);
      border-radius: 0.75rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
      position: relative;
      transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
    }
    .card-base:hover {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 8px 20px -4px rgba(47, 84, 150, 0.1);
    }
    :host-context(.dark) .card-base {
      background: rgba(30, 41, 59, 0.5);
      border-color: rgba(255, 255, 255, 0.04);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    }
    :host-context(.dark) .card-base:hover {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15), 0 8px 20px -4px rgba(59, 130, 246, 0.1);
    }

    /* ── Heatmap hero section ──────────────────────── */
    .heatmap-container {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
      border: 1px solid rgba(59, 130, 246, 0.15);
      box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }
    .heatmap-toolbar {
      background: linear-gradient(90deg, rgba(47, 84, 150, 0.3) 0%, rgba(30, 58, 138, 0.2) 100%);
      border-bottom: 1px solid rgba(59, 130, 246, 0.12);
    }
    .heatmap-corner-cell {
      background: rgba(30, 41, 59, 0.8);
      color: #94A3B8;
    }
    .heatmap-col-idle {
      background: rgba(30, 41, 59, 0.6);
      color: #94A3B8;
    }
    .heatmap-col-active {
      background: rgba(59, 130, 246, 0.2);
      color: #93C5FD;
    }

    /* ── Pagination ────────────────────────────────── */
    .pagination-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 5px;
      color: #64748B;
      transition: all 0.15s;
    }
    .pagination-btn:hover:not(.pagination-btn-disabled) {
      background: #F1F5F9;
      color: #2F5496;
    }
    .pagination-btn-disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    :host-context(.dark) .pagination-btn {
      color: #94A3B8;
    }
    :host-context(.dark) .pagination-btn:hover:not(.pagination-btn-disabled) {
      background: rgba(51, 65, 85, 0.5);
      color: #93C5FD;
    }
    .pagination-num {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 500;
      color: #64748B;
      transition: all 0.15s;
      padding: 0 4px;
    }
    .pagination-num:hover {
      background: #F1F5F9;
    }
    .pagination-num-active {
      background: #2F5496 !important;
      color: white !important;
      box-shadow: 0 1px 3px rgba(47, 84, 150, 0.3);
    }
    :host-context(.dark) .pagination-num {
      color: #94A3B8;
    }
    :host-context(.dark) .pagination-num:hover {
      background: rgba(51, 65, 85, 0.5);
    }
    :host-context(.dark) .pagination-num-active {
      background: #2F5496 !important;
      color: white !important;
    }

    /* ── Training animations ──────────────────────── */
    .training-shimmer {
      animation: shimmer 2s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .training-progress {
      width: 30%;
      animation: progress-indeterminate 1.8s ease-in-out infinite;
    }
    @keyframes progress-indeterminate {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(200%); }
      100% { transform: translateX(-100%); }
    }
  `],
})
export class ProbabilitiesComponent implements OnInit {
  // --- Training ---
  trainingLoading = false;
  trainingResult: { status: string; message: string } | null = null;

  // --- Model Stats ---
  modelStats: ModelStats | null = null;

  // --- Emission ---
  emissionLoading = false;
  emissionData: EmissionEntry[] = [];
  emissionFilter = '';
  emissionDescriptions: Record<string, string> = {};
  emissionPage = 0;

  // --- Transition ---
  transitionLoading = false;
  transitionData: TransitionEntry[] = [];
  transitionFilter = '';
  transitionPage = 0;

  // --- Heatmap ---
  heatmapTags: string[] = [];
  heatmapMatrix: Record<string, Record<string, number>> = {};
  hoveredRow: number | null = null;
  hoveredCol: number | null = null;
  selectedCell: SelectedCell | null = null;
  highlightedTag: string | null = null;

  // --- Pagination ---
  readonly pageSize = 10;

  // --- Skeletons ---
  skeletonRowsSmall = Array.from({ length: 10 }, (_, i) => i);
  skeletonGrid = Array.from({ length: 144 }, (_, i) => i);

  constructor(public apiService: ApiService) {}

  ngOnInit(): void {
    this.loadEmissionTable();
    this.loadTransitionTable();
  }

  // ── Stat cards ─────────────────────────────────────────

  get modelStatCards(): StatCard[] {
    if (!this.modelStats) return [];
    return [
      {
        label: 'Pares Emision',
        value: this.modelStats.emission_count.toLocaleString(),
        icon: 'M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z',
      },
      {
        label: 'Pares Transicion',
        value: this.modelStats.transition_count.toLocaleString(),
        icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
      },
      {
        label: 'Etiquetas Unicas',
        value: this.modelStats.unique_tags.toLocaleString(),
        icon: 'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z',
      },
      {
        label: 'Vocabulario',
        value: this.modelStats.vocabulary_size.toLocaleString(),
        icon: 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
      },
      {
        label: 'Suavizado \u03B1',
        value: this.modelStats.smoothing_alpha.toString(),
        icon: 'M4.745 3A23.933 23.933 0 0 0 3 12c0 3.183.62 6.22 1.745 9M19.255 3c1.125 2.78 1.745 5.817 1.745 9s-.62 6.22-1.745 9M12 3a23.933 23.933 0 0 1 1.745 9c0 3.183-.62 6.22-1.745 9m0-18a23.933 23.933 0 0 0-1.745 9c0 3.183.62 6.22 1.745 9',
      },
    ];
  }

  // ── Train ──────────────────────────────────────────────

  trainModel(): void {
    this.trainingLoading = true;
    this.trainingResult = null;
    this.apiService.trainModel().subscribe({
      next: (res) => {
        this.trainingResult = { status: res.status, message: res.message };
        this.trainingLoading = false;
        if (res.detail) {
          this.modelStats = {
            emission_count: res.detail['emission_count'] || 0,
            transition_count: res.detail['transition_count'] || 0,
            unique_tags: res.detail['unique_tags'] || 0,
            vocabulary_size: res.detail['vocabulary_size'] || 0,
            smoothing_alpha: res.detail['smoothing_alpha'] ?? 1.0,
          };
        }
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

  // ── Emission ───────────────────────────────────────────

  loadEmissionTable(): void {
    this.emissionLoading = true;
    this.apiService.getEmissionTable(30).subscribe({
      next: (data: any) => {
        this.emissionData = data.entries || data || [];
        this.emissionPage = 0;
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

  get paginatedEmissions(): EmissionEntry[] {
    const start = this.emissionPage * this.pageSize;
    return this.filteredEmissions.slice(start, start + this.pageSize);
  }

  get emissionTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEmissions.length / this.pageSize));
  }

  get emissionPageEnd(): number {
    return Math.min((this.emissionPage + 1) * this.pageSize, this.filteredEmissions.length);
  }

  get emissionPages(): number[] {
    const total = this.emissionTotalPages;
    return Array.from({ length: Math.min(total, 5) }, (_, i) => {
      if (total <= 5) return i;
      const start = Math.min(Math.max(this.emissionPage - 2, 0), total - 5);
      return start + i;
    });
  }

  // ── Transition ─────────────────────────────────────────

  loadTransitionTable(): void {
    this.transitionLoading = true;
    this.apiService.getTransitionTable().subscribe({
      next: (data: any) => {
        this.transitionData = data.entries || data || [];
        this.transitionPage = 0;
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

  get paginatedTransitions(): TransitionEntry[] {
    const start = this.transitionPage * this.pageSize;
    return this.filteredTransitions.slice(start, start + this.pageSize);
  }

  get transitionTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTransitions.length / this.pageSize));
  }

  get transitionPageEnd(): number {
    return Math.min((this.transitionPage + 1) * this.pageSize, this.filteredTransitions.length);
  }

  get transitionVisiblePages(): number[] {
    const total = this.transitionTotalPages;
    const show = Math.min(total, 5);
    return Array.from({ length: show }, (_, i) => {
      if (total <= 5) return i;
      const start = Math.min(Math.max(this.transitionPage - 2, 0), total - 5);
      return start + i;
    });
  }

  // ── Heatmap ────────────────────────────────────────────

  private buildHeatmap(): void {
    const tagCounts: Record<string, number> = {};
    for (const entry of this.transitionData) {
      tagCounts[entry.tag_prev] = (tagCounts[entry.tag_prev] || 0) + entry.count;
      tagCounts[entry.tag_next] = (tagCounts[entry.tag_next] || 0) + entry.count;
    }

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([tag]) => tag);

    this.heatmapTags = sortedTags;

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
    if (probability <= 0) return 'rgba(255,255,255,0.03)';
    if (probability < 0.02) return '#1E3A5F';
    if (probability < 0.05) return '#1E4D8C';
    if (probability < 0.10) return '#2563EB';
    if (probability < 0.20) return '#3B82F6';
    if (probability < 0.35) return '#60A5FA';
    if (probability < 0.50) return '#93C5FD';
    if (probability < 0.70) return '#BFDBFE';
    return '#EFF6FF';
  }

  getHeatmapTextColor(probability: number): string {
    if (probability <= 0) return 'transparent';
    return probability < 0.35 ? 'rgba(255,255,255,0.8)' : '#1E293B';
  }

  selectHeatmapCell(rowTag: string, colTag: string, probability: number): void {
    this.selectedCell = { rowTag, colTag, probability };
  }

  scrollToTag(tag: string): void {
    this.highlightedTag = tag;
    const el = document.getElementById('heatmap-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      this.highlightedTag = null;
    }, 3000);
  }
}
