import { Component } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ViterbiResult } from '../../core/models/viterbi.model';

interface HistoryEntry {
  sentence: string;
  tags: string[];
  tokens: string[];
  created_at: string;
}

@Component({
  selector: 'app-viterbi',
  standalone: true,
  imports: [FormsModule, SlicePipe],
  template: `
    <div class="px-3 py-5">

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- TOP BAR                                                  -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 animate-fadeInUp">
        <div>
          <h1 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Algoritmo de Viterbi
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Etiquetado morfosintactico con HMM Bigram + Viterbi — Corpus EAGLES
          </p>
        </div>
        @if (result) {
          <button
            (click)="exportExcel()"
            [disabled]="exporting"
            class="px-4 py-1.5 text-xs font-medium rounded-lg border border-[#2F5496] dark:border-blue-400
                   text-[#2F5496] dark:text-blue-300 hover:bg-[#2F5496]/10 dark:hover:bg-blue-500/15
                   transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-1.5 shadow-sm whitespace-nowrap">
            @if (exporting) {
              <svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            } @else {
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            {{ exporting ? 'Exportando...' : 'Excel' }}
          </button>
        }
      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- INPUT CARD                                               -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <div class="card-base p-4 mb-3 animate-fadeInUp" style="animation-delay: 40ms">
        <div class="flex flex-col sm:flex-row gap-2.5">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="sentence"
              placeholder="Escribe una oracion en espanol..."
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                     bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100
                     focus:ring-2 focus:ring-[#2F5496]/30 focus:border-[#2F5496] outline-none transition"
              (keydown.enter)="tagSentence()" />
          </div>
          <button
            (click)="tagSentence()"
            [disabled]="loading || !sentence.trim()"
            class="px-5 py-2 bg-[#2F5496] text-white rounded-lg text-sm font-semibold
                   hover:bg-[#244078] transition-all duration-200 disabled:opacity-50
                   disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-sm">
            @if (loading) {
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            {{ loading ? 'Procesando...' : 'Etiquetar' }}
          </button>
        </div>

        <!-- Quick sentences -->
        <div class="flex flex-wrap items-center gap-2 mt-3">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Requeridas:
          </span>
          @for (s of quickSentences; track $index) {
            <button
              (click)="loadSentence(s)"
              class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150
                     border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20
                     text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:shadow-sm">
              <span class="flex items-center justify-center w-4 h-4 rounded-full bg-[#2F5496] text-[9px] font-bold text-white">
                {{ $index + 1 }}
              </span>
              {{ s }}
            </button>
          }
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- ERROR TOAST                                              -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (error) {
        <div class="mb-3 rounded-xl px-4 py-3 flex items-center gap-3 animate-fadeInUp
                    bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-medium text-red-700 dark:text-red-300 flex-1">{{ error }}</p>
          <button (click)="error = null"
                  class="text-red-400 hover:text-red-600 dark:hover:text-red-200 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- LOADING BANNER                                           -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (loading) {
        <div class="mb-3 rounded-xl overflow-hidden animate-fadeInUp">
          <div class="relative bg-gradient-to-r from-[#2F5496] via-[#3B6BC4] to-[#2F5496] px-5 py-4">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent viterbi-shimmer"></div>
            <div class="relative flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              </div>
              <div>
                <p class="text-white font-semibold text-sm">Ejecutando algoritmo de Viterbi...</p>
                <p class="text-blue-100/80 text-xs mt-0.5">
                  Calculando camino optimo sobre la trellis HMM
                </p>
              </div>
            </div>
            <div class="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-white/40 rounded-full viterbi-progress"></div>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- STATS STRIP                                              -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (result && !loading) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 animate-fadeInUp" style="animation-delay: 40ms">
          @for (card of resultStatCards; track card.label) {
            <div class="card-base px-3 py-2.5">
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
      <!-- TAGGED RESULT                                            -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (result && !loading) {
        <div class="card-base overflow-hidden mb-3 animate-fadeInUp" style="animation-delay: 80ms">
          <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300 flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"/>
              </svg>
              Resultado del etiquetado
            </h2>
            <span class="font-mono text-[10px] bg-[#2F5496]/10 dark:bg-blue-500/15 text-[#2F5496] dark:text-blue-300 px-2.5 py-1 rounded-full">
              P = {{ formatScientific(result.best_path_prob) }}
            </span>
          </div>

          <div class="p-4">
            <!-- Sentence -->
            <p class="text-xs text-slate-500 dark:text-slate-400 italic mb-3">
              &laquo;{{ result.sentence }}&raquo;
            </p>

            <!-- Token cards -->
            <div class="flex flex-wrap gap-2">
              @for (token of result.tokens; track $index) {
                <div class="group relative flex flex-col items-center gap-1 rounded-lg px-3 py-2
                            bg-gray-50/80 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600
                            hover:border-[#2F5496]/30 dark:hover:border-blue-500/30
                            hover:shadow-sm transition-all duration-150">
                  <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ token }}</span>
                  <span
                    class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm"
                    [style.background-color]="getTagColor(result.tags[$index])">
                    {{ result.tags[$index] }}
                  </span>
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-[120px] leading-tight">
                    {{ result.descriptions[$index] || '\u2014' }}
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- VITERBI MATRIX (heatmap style)                          -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (result && !loading && matrixTags.length > 0) {
        <section class="matrix-hero mb-3 animate-fadeInUp" style="animation-delay: 120ms">
          <div class="matrix-container rounded-2xl overflow-hidden">
            <!-- Header bar -->
            <div class="matrix-toolbar px-4 py-2.5 flex items-center justify-between">
              <h2 class="text-sm font-semibold text-white flex items-center gap-2">
                <svg class="w-4.5 h-4.5 opacity-80" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5"/>
                </svg>
                Matriz de Viterbi
                <span class="text-xs font-normal text-blue-200 ml-1">{{ matrixTags.length }} estados &times; {{ result.tokens.length }} obs.</span>
              </h2>
              <div class="flex items-center gap-3">
                @if (selectedMatrixCell) {
                  <div class="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-xs">
                    <span class="text-white font-mono font-semibold">{{ selectedMatrixCell.tag }}</span>
                    <span class="text-blue-300">&rarr;</span>
                    <span class="text-white font-medium">{{ selectedMatrixCell.token }}</span>
                    <span class="text-blue-200">P = {{ formatScientific(selectedMatrixCell.prob) }}</span>
                    <button (click)="selectedMatrixCell = null"
                            class="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/30 transition">
                      <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </div>

            <!-- Legend -->
            <div class="px-4 py-2 flex items-center gap-4 text-[10px] border-b border-white/5">
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-sm bg-green-500/60 border border-green-400/40"></div>
                <span class="text-blue-200/70">Camino optimo</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-sm" style="background: #2563EB;"></div>
                <span class="text-blue-200/70">Probabilidad alta</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-sm" style="background: #1E3A5F;"></div>
                <span class="text-blue-200/70">Probabilidad baja</span>
              </div>
            </div>

            <!-- Matrix table -->
            <div class="px-4 pt-1 pb-3 overflow-x-auto">
              <table class="text-xs border-separate w-full" style="border-spacing: 2px;">
                <thead>
                  <tr>
                    <th class="px-2 py-2 sticky left-0 z-10 min-w-[60px] rounded text-[10px] font-semibold matrix-corner-cell">
                      Estado \\ Obs.
                    </th>
                    @for (token of result.tokens; track $index; let ci = $index) {
                      <th class="px-2 py-2 text-center min-w-[72px] rounded text-[10px] font-semibold transition-colors duration-100"
                          [class]="matrixHoveredCol === ci ? 'matrix-header-active' : 'matrix-header-idle'">
                        {{ token }}
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (tag of matrixTags; track tag; let ri = $index) {
                    <tr>
                      <td class="px-2 py-1 sticky left-0 z-10 min-w-[60px] rounded text-[10px] font-mono font-semibold transition-colors duration-100"
                          [class]="matrixHoveredRow === ri ? 'matrix-header-active' : 'matrix-header-idle'"
                          [title]="tag">
                        {{ tag }}
                      </td>
                      @for (token of result.tokens; track $index; let ci = $index) {
                        <td class="text-center font-mono cursor-pointer rounded-[3px] transition-all duration-100 relative"
                            [style.background-color]="isOptimalCell(ci, tag) ? 'rgba(34, 197, 94, 0.25)' : getMatrixCellColor(getMatrixValue(ci, tag))"
                            [style.color]="isOptimalCell(ci, tag) ? '#86EFAC' : getMatrixTextColor(getMatrixValue(ci, tag))"
                            [style.outline]="matrixHoveredRow === ri && matrixHoveredCol === ci ? '2px solid #60A5FA' : (isOptimalCell(ci, tag) ? '1px solid rgba(34, 197, 94, 0.4)' : 'none')"
                            [style.outline-offset]="'-1px'"
                            [style.opacity]="(matrixHoveredRow !== null && matrixHoveredRow !== ri && matrixHoveredCol !== ci) ? 0.4 : 1"
                            [style.transform]="matrixHoveredRow === ri && matrixHoveredCol === ci ? 'scale(1.1)' : 'scale(1)'"
                            [title]="tag + ' @ ' + token + ': ' + formatScientific(getMatrixValue(ci, tag))"
                            (mouseenter)="matrixHoveredRow = ri; matrixHoveredCol = ci"
                            (mouseleave)="matrixHoveredRow = null; matrixHoveredCol = null"
                            (click)="selectMatrixCell(tag, token, getMatrixValue(ci, tag))">
                          @if (getMatrixValue(ci, tag) !== null) {
                            <span class="text-[9px] leading-[24px] font-medium">
                              {{ formatScientific(getMatrixValue(ci, tag)!) }}
                            </span>
                            @if (getBackpointer(ci, tag); as bp) {
                              <div class="text-[8px] -mt-0.5 mb-0.5"
                                   [style.color]="isOptimalCell(ci, tag) ? '#4ADE80' : 'rgba(148,163,184,0.6)'">
                                &#8592;{{ bp }}
                              </div>
                            }
                          } @else {
                            <span class="text-[9px] leading-[24px]" style="color: rgba(255,255,255,0.1);">&middot;</span>
                          }
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </section>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- STEP-BY-STEP (timeline)                                  -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (result && !loading && result.steps && result.steps.length > 0) {
        <div class="card-base overflow-hidden mb-3 animate-fadeInUp" style="animation-delay: 160ms">
          <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300 flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/>
              </svg>
              Ejecucion paso a paso
            </h2>
            <button (click)="stepsExpanded = !stepsExpanded"
                    class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition flex items-center gap-1">
              {{ stepsExpanded ? 'Colapsar' : 'Expandir' }}
              <svg class="w-3.5 h-3.5 transition-transform duration-200"
                   [class.rotate-180]="stepsExpanded"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          @if (stepsExpanded) {
            <div class="p-4">
              <div class="relative">
                <!-- Timeline line -->
                <div class="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-300 via-slate-300 to-indigo-300 dark:from-blue-700 dark:via-slate-600 dark:to-indigo-700"></div>

                <div class="space-y-1.5">
                  @for (step of result.steps; track $index) {
                    <div class="relative flex items-start gap-3 pl-1 py-1.5">
                      <!-- Dot -->
                      <div class="relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full shrink-0 text-[10px] font-bold shadow-sm"
                           [class]="$index === 0 ? 'bg-blue-500 text-white' : ($index === result.steps.length - 1 ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600')">
                        {{ $index + 1 }}
                      </div>

                      <!-- Content -->
                      <div class="flex-1 min-w-0 pt-0.5">
                        <div class="flex flex-wrap items-center gap-1.5">
                          <span class="text-[11px] font-semibold"
                                [class]="$index === 0 ? 'text-blue-600 dark:text-blue-400' : ($index === result.steps.length - 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200')">
                            {{ getStepLabel($index) }}
                          </span>
                          <span class="font-mono text-[11px] text-[#2F5496] dark:text-blue-300 font-bold">&laquo;{{ step.token }}&raquo;</span>
                          <span class="text-slate-300 dark:text-slate-600">&rarr;</span>
                          <span
                            class="inline-block rounded-full px-1.5 py-px text-[9px] font-bold text-white"
                            [style.background-color]="getTagColor(step.tag)">
                            {{ step.tag }}
                          </span>
                          <span class="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                            {{ formatScientific(step.probability) }}
                          </span>
                        </div>
                        <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{{ step.description }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- COMPARISON                                               -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (resultA && resultB && !loading) {
        <div class="card-base overflow-hidden mb-3 animate-fadeInUp" style="animation-delay: 200ms">
          <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
            <h2 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300 flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
              </svg>
              Comparacion de etiquetados
              @if (comparisonDiffs.length > 0) {
                <span class="ml-2 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                  {{ comparisonDiffs.length }} diferencia{{ comparisonDiffs.length !== 1 ? 's' : '' }}
                </span>
              } @else {
                <span class="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  Identicas
                </span>
              }
            </h2>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-700">
            <!-- Sentence A -->
            <div class="p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-5 h-5 rounded-full bg-[#2F5496] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                <p class="text-xs text-slate-500 dark:text-slate-400 italic truncate">&laquo;{{ resultA.sentence }}&raquo;</p>
              </div>
              <div class="flex flex-wrap gap-1.5">
                @for (token of resultA.tokens; track $index) {
                  <div class="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 border transition-colors duration-150"
                       [class]="isDifferentTag(token, resultA.tags[$index], 'A')
                         ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/15'
                         : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'">
                    <span class="text-[11px] font-medium text-slate-700 dark:text-slate-200">{{ token }}</span>
                    <span class="inline-block rounded-full px-1.5 py-px text-[9px] font-bold text-white"
                          [style.background-color]="getTagColor(resultA.tags[$index])">
                      {{ resultA.tags[$index] }}
                    </span>
                  </div>
                }
              </div>
              <p class="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                P = {{ formatScientific(resultA.best_path_prob) }}
              </p>
            </div>

            <!-- Sentence B -->
            <div class="p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-5 h-5 rounded-full bg-[#2F5496] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                <p class="text-xs text-slate-500 dark:text-slate-400 italic truncate">&laquo;{{ resultB.sentence }}&raquo;</p>
              </div>
              <div class="flex flex-wrap gap-1.5">
                @for (token of resultB.tokens; track $index) {
                  <div class="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 border transition-colors duration-150"
                       [class]="isDifferentTag(token, resultB.tags[$index], 'B')
                         ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/15'
                         : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'">
                    <span class="text-[11px] font-medium text-slate-700 dark:text-slate-200">{{ token }}</span>
                    <span class="inline-block rounded-full px-1.5 py-px text-[9px] font-bold text-white"
                          [style.background-color]="getTagColor(resultB.tags[$index])">
                      {{ resultB.tags[$index] }}
                    </span>
                  </div>
                }
              </div>
              <p class="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                P = {{ formatScientific(resultB.best_path_prob) }}
              </p>
            </div>
          </div>

          <!-- Differences table -->
          @if (comparisonDiffs.length > 0) {
            <div class="border-t border-gray-100 dark:border-gray-700">
              <table class="w-full text-xs">
                <thead>
                  <tr class="bg-orange-50/50 dark:bg-orange-900/10">
                    <th class="px-4 py-2 text-left font-semibold text-[9px] uppercase tracking-wider text-orange-600 dark:text-orange-400">Token</th>
                    <th class="px-4 py-2 text-center font-semibold text-[9px] uppercase tracking-wider text-orange-600 dark:text-orange-400">Oracion 1</th>
                    <th class="px-4 py-2 text-center font-semibold text-[9px] uppercase tracking-wider text-orange-600 dark:text-orange-400">Oracion 2</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                  @for (diff of comparisonDiffs; track diff.token) {
                    <tr class="hover:bg-orange-50/30 dark:hover:bg-orange-900/5 transition-colors">
                      <td class="px-4 py-1.5 font-medium text-slate-700 dark:text-slate-200">{{ diff.token }}</td>
                      <td class="px-4 py-1.5 text-center">
                        <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                              [style.background-color]="getTagColor(diff.tagA)">{{ diff.tagA }}</span>
                      </td>
                      <td class="px-4 py-1.5 text-center">
                        <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                              [style.background-color]="getTagColor(diff.tagB)">{{ diff.tagB }}</span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- HISTORY                                                  -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (history.length > 0 && !loading) {
        <div class="card-base overflow-hidden mb-0 animate-fadeInUp" style="animation-delay: 240ms">
          <div class="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300 flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
              Historial reciente
              <span class="text-xs font-normal text-slate-400 ml-1">({{ history.length }})</span>
            </h2>
          </div>

          <div class="divide-y divide-gray-100 dark:divide-gray-700/50">
            @for (entry of history | slice:0:5; track $index) {
              <button
                class="w-full px-4 py-2.5 text-left hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors duration-150 flex items-center gap-3"
                (click)="loadFromHistory(entry)">
                <div class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs text-slate-700 dark:text-slate-200 truncate">{{ entry.sentence }}</p>
                  <div class="flex gap-1 mt-0.5 flex-wrap">
                    @for (tag of entry.tags | slice:0:6; track $index) {
                      <span class="px-1 py-px text-[8px] rounded font-mono font-bold text-white"
                            [style.background-color]="getTagColor(tag)">{{ tag }}</span>
                    }
                    @if (entry.tags.length > 6) {
                      <span class="text-[9px] text-slate-400">+{{ entry.tags.length - 6 }}</span>
                    }
                  </div>
                </div>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                  {{ formatDate(entry.created_at) }}
                </span>
              </button>
            }
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- EMPTY STATE                                              -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (!result && !loading && !error) {
        <div class="text-center py-16 animate-fadeInUp" style="animation-delay: 80ms">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#2F5496]/10 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10
                      flex items-center justify-center">
            <svg class="w-8 h-8 text-[#2F5496]/40 dark:text-blue-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p class="text-sm text-slate-400 dark:text-slate-500">
            Introduce una oracion y pulsa <span class="font-semibold text-[#2F5496] dark:text-blue-400">Etiquetar</span> para ejecutar Viterbi.
          </p>
          <p class="text-xs text-slate-300 dark:text-slate-600 mt-1">
            O selecciona una de las oraciones requeridas.
          </p>
        </div>
      }

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

    /* ── Matrix hero section ─────────────────────────── */
    .matrix-container {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
      border: 1px solid rgba(59, 130, 246, 0.15);
      box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }
    .matrix-toolbar {
      background: linear-gradient(90deg, rgba(47, 84, 150, 0.3) 0%, rgba(30, 58, 138, 0.2) 100%);
      border-bottom: 1px solid rgba(59, 130, 246, 0.12);
    }
    .matrix-corner-cell {
      background: rgba(30, 41, 59, 0.8);
      color: #94A3B8;
    }
    .matrix-header-idle {
      background: rgba(30, 41, 59, 0.6);
      color: #94A3B8;
    }
    .matrix-header-active {
      background: rgba(59, 130, 246, 0.2);
      color: #93C5FD;
    }

    /* ── Animations ──────────────────────────────────── */
    .viterbi-shimmer {
      animation: shimmer 2s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .viterbi-progress {
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
export class ViterbiComponent {

  // ── State ──────────────────────────────────────────
  sentence = 'Habla con el enfermo grave de trasplantes.';
  loading = false;
  exporting = false;
  error: string | null = null;
  stepsExpanded = true;

  result: ViterbiResult | null = null;

  // Comparison
  resultA: ViterbiResult | null = null;
  resultB: ViterbiResult | null = null;
  comparisonDiffs: { token: string; tagA: string; tagB: string }[] = [];

  // Matrix
  matrixTags: string[] = [];
  matrixHoveredRow: number | null = null;
  matrixHoveredCol: number | null = null;
  selectedMatrixCell: { tag: string; token: string; prob: number | null } | null = null;

  // History
  history: HistoryEntry[] = [];

  // Quick sentences
  readonly quickSentences: string[] = [
    'Habla con el enfermo grave de trasplantes.',
    'El enfermo grave habla de trasplantes.',
  ];

  // EAGLES tag color map
  private readonly tagColorMap: Record<string, string> = {
    A: '#6366f1', // Adjetivo    - indigo
    C: '#8b5cf6', // Conjuncion  - violet
    D: '#0ea5e9', // Determinante - sky
    F: '#94a3b8', // Puntuacion  - slate
    I: '#f43f5e', // Interjec.   - rose
    N: '#2F5496', // Nombre      - UNIR blue
    P: '#14b8a6', // Pronombre   - teal
    R: '#0ea5e9', // Adverbio    - sky
    S: '#10b981', // Preposicion - emerald
    V: '#ef4444', // Verbo       - red
    W: '#a855f7', // Fecha       - purple
    Z: '#06b6d4', // Numeral     - cyan
  };

  constructor(private apiService: ApiService) {
    this.loadHistory();
  }

  // ── Stat cards ──────────────────────────────────────

  get resultStatCards() {
    if (!this.result) return [];
    const uniqueTags = new Set(this.result.tags).size;
    return [
      {
        label: 'Tokens',
        value: this.result.tokens.length.toString(),
        icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z',
      },
      {
        label: 'Tags Unicos',
        value: uniqueTags.toString(),
        icon: 'M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z',
      },
      {
        label: 'Prob. Camino',
        value: this.formatScientific(this.result.best_path_prob),
        icon: 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6',
      },
      {
        label: 'Estados Matriz',
        value: this.matrixTags.length.toString(),
        icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375',
      },
    ];
  }

  // ── Actions ────────────────────────────────────────

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
        this.loadHistory();
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

  // ── History ────────────────────────────────────────

  loadHistory(): void {
    this.apiService.getTaggingHistory(10).subscribe({
      next: (res) => {
        this.history = res.results || [];
      },
      error: () => {
        this.history = [];
      },
    });
  }

  loadFromHistory(entry: HistoryEntry): void {
    this.sentence = entry.sentence;
    this.tagSentence();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  // ── Viterbi Matrix ─────────────────────────────────

  private extractMatrixTags(): void {
    if (!this.result?.viterbi_matrix?.length) {
      this.matrixTags = [];
      return;
    }
    const tagSet = new Set<string>();
    for (const col of this.result.viterbi_matrix) {
      if (col) {
        Object.keys(col).forEach((k) => {
          if (k !== 'token') tagSet.add(k);
        });
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

  isOptimalCell(colIdx: number, tag: string): boolean {
    if (!this.result) return false;
    return this.result.tags[colIdx] === tag;
  }

  getMatrixCellColor(value: number | null): string {
    if (value === null || value === 0) return 'rgba(255,255,255,0.02)';
    // Log scale for better visual spread
    const logVal = -Math.log10(Math.max(value, 1e-30));
    // Lower logVal = higher prob
    if (logVal < 2) return '#2563EB';
    if (logVal < 4) return '#1E4D8C';
    if (logVal < 6) return '#1E3A5F';
    if (logVal < 10) return '#162C4A';
    if (logVal < 15) return '#0F2035';
    return '#0B1525';
  }

  getMatrixTextColor(value: number | null): string {
    if (value === null || value === 0) return 'transparent';
    return 'rgba(255,255,255,0.75)';
  }

  selectMatrixCell(tag: string, token: string, prob: number | null): void {
    this.selectedMatrixCell = { tag, token, prob };
  }

  // ── Steps ──────────────────────────────────────────

  getStepLabel(index: number): string {
    if (!this.result) return '';
    if (index === 0) return 'Inicializacion';
    if (index === this.result.steps.length - 1 && index > 0) return 'Terminacion';
    return `Recursion t=${index}`;
  }

  // ── Comparison ─────────────────────────────────────

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

    const mapA = new Map<string, string>();
    const mapB = new Map<string, string>();
    this.resultA.tokens.forEach((t, i) => mapA.set(t.toLowerCase(), this.resultA!.tags[i]));
    this.resultB.tokens.forEach((t, i) => mapB.set(t.toLowerCase(), this.resultB!.tags[i]));

    const allTokens = new Set([...mapA.keys(), ...mapB.keys()]);
    for (const token of allTokens) {
      const tagA = mapA.get(token);
      const tagB = mapB.get(token);
      if (tagA && tagB && tagA !== tagB) {
        this.comparisonDiffs.push({ token, tagA, tagB });
      }
    }
  }

  isDifferentTag(token: string, tag: string, source: 'A' | 'B'): boolean {
    const other = source === 'A' ? this.resultB : this.resultA;
    if (!other) return false;
    const lc = token.toLowerCase();
    const idx = other.tokens.findIndex((t) => t.toLowerCase() === lc);
    if (idx === -1) return false;
    return other.tags[idx] !== tag;
  }

  // ── Utilities ──────────────────────────────────────

  getTagColor(tag: string | null | undefined): string {
    if (!tag || tag.length === 0) return '#9ca3af';
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
