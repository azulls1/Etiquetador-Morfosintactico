import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ViterbiResult, AnalysisQuestion, EvaluationResult } from '../../core/models/viterbi.model';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-4 sm:space-y-6">

      <!-- ============================================================ -->
      <!-- ENCABEZADO                                                    -->
      <!-- ============================================================ -->
      <div>
        <h1 class="text-2xl font-bold text-[#04202C]">Parte 3: Analisis Comparativo y Preguntas</h1>
        <p class="text-sm text-gray-700 mt-1">
          Analisis del etiquetado morfosintactico de las oraciones requeridas, evaluacion de resultados,
          limitaciones del etiquetador HMM y propuestas de mejora.
        </p>
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 1: ETIQUETADO COMPARATIVO                            -->
      <!-- ============================================================ -->
      <div class="bg-white rounded-2xl shadow p-6 space-y-5">
        <h2 class="text-lg font-semibold text-gray-800">Etiquetado comparativo</h2>
        <p class="text-xs text-gray-700">
          Etiqueta ambas oraciones para comparar como el contexto (orden de palabras) afecta las probabilidades
          de transicion y, por tanto, las etiquetas asignadas por el algoritmo de Viterbi.
        </p>

        <!-- Botones para etiquetar -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            (click)="tagSentenceA()"
            [disabled]="loadingA"
            class="flex-1 rounded-lg border-2 border-[#04202C] px-5 py-3 text-sm font-semibold transition
                   disabled:opacity-50 disabled:cursor-not-allowed"
            [class]="resultA ? 'bg-[#04202C] text-white' : 'bg-white text-[#04202C] hover:bg-[#04202C]/10'">
            @if (loadingA) {
              <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 align-middle"></span>
            }
            @if (resultA) {
              <span class="mr-1">&#10003;</span>
            }
            {{ loadingA ? 'Etiquetando...' : 'Etiquetar Oracion 1' }}
            <br>
            <span class="text-xs font-normal opacity-80">&laquo;{{ sentenceA }}&raquo;</span>
          </button>

          <button
            (click)="tagSentenceB()"
            [disabled]="loadingB"
            class="flex-1 rounded-lg border-2 border-[#04202C] px-5 py-3 text-sm font-semibold transition
                   disabled:opacity-50 disabled:cursor-not-allowed"
            [class]="resultB ? 'bg-[#04202C] text-white' : 'bg-white text-[#04202C] hover:bg-[#04202C]/10'">
            @if (loadingB) {
              <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 align-middle"></span>
            }
            @if (resultB) {
              <span class="mr-1">&#10003;</span>
            }
            {{ loadingB ? 'Etiquetando...' : 'Etiquetar Oracion 2' }}
            <br>
            <span class="text-xs font-normal opacity-80">&laquo;{{ sentenceB }}&raquo;</span>
          </button>

          <button
            (click)="tagBoth()"
            [disabled]="loadingA || loadingB"
            class="rounded-lg border-2 border-[#04202C] px-5 py-3 text-sm font-semibold transition
                   disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            [class]="resultA && resultB ? 'bg-[#04202C] text-white' : 'bg-white text-[#04202C] hover:bg-[#04202C]/10'">
            @if (resultA && resultB) {
              <span class="mr-1">&#10003;</span>
            }
            Etiquetar ambas
          </button>
        </div>

        <!-- Spinner -->
        <app-loading-spinner [loading]="loadingA || loadingB" message="Ejecutando algoritmo de Viterbi..."></app-loading-spinner>

        <!-- Error -->
        @if (error) {
          <div class="rounded-2xl bg-red-50 border border-red-200 p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        }

        <!-- Resultados lado a lado -->
        @if (resultA && resultB && !loadingA && !loadingB) {
        <div class="space-y-5">

          <!-- Comparacion visual -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Oracion A -->
            <div class="space-y-3 border border-gray-200 rounded-xl p-4">
              <h3 class="text-sm font-semibold text-[#04202C]">Oracion 1</h3>
              <p class="text-xs text-gray-700 italic">&laquo;{{ resultA.sentence }}&raquo;</p>
              <div class="flex flex-wrap gap-2">
                @for (token of resultA.tokens; track $index; let i = $index) {
                  <div
                    class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 border"
                    [class]="isDifferentTag(token, resultA.tags[i], 'A') ? 'border-violet-300 bg-violet-50' : 'border-gray-200 bg-gray-50'">
                    <span class="text-sm font-medium text-gray-800">{{ token }}</span>
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-[#04202C] border"
                      [style.background-color]="getTagBgColor(resultA.tags[i])"
                      [style.border-color]="getTagColor(resultA.tags[i]) + '30'">
                      {{ resultA.tags[i] }}
                    </span>
                    <span class="text-xs text-gray-700 text-center max-w-[120px] leading-tight">
                      {{ resultA.descriptions[i] }}
                    </span>
                  </div>
                }
              </div>
              <p class="text-xs font-mono text-gray-800">
                P(mejor camino) = {{ formatScientific(resultA.best_path_prob) }}
              </p>
            </div>

            <!-- Oracion B -->
            <div class="space-y-3 border border-gray-200 rounded-xl p-4">
              <h3 class="text-sm font-semibold text-[#04202C]">Oracion 2</h3>
              <p class="text-xs text-gray-700 italic">&laquo;{{ resultB.sentence }}&raquo;</p>
              <div class="flex flex-wrap gap-2">
                @for (token of resultB.tokens; track $index; let i = $index) {
                  <div
                    class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 border"
                    [class]="isDifferentTag(token, resultB.tags[i], 'B') ? 'border-violet-300 bg-violet-50' : 'border-gray-200 bg-gray-50'">
                    <span class="text-sm font-medium text-gray-800">{{ token }}</span>
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-[#04202C] border"
                      [style.background-color]="getTagBgColor(resultB.tags[i])"
                      [style.border-color]="getTagColor(resultB.tags[i]) + '30'">
                      {{ resultB.tags[i] }}
                    </span>
                    <span class="text-xs text-gray-700 text-center max-w-[120px] leading-tight">
                      {{ resultB.descriptions[i] }}
                    </span>
                  </div>
                }
              </div>
              <p class="text-xs font-mono text-gray-800">
                P(mejor camino) = {{ formatScientific(resultB.best_path_prob) }}
              </p>
            </div>
          </div>

          <!-- Tabla de diferencias -->
          <div class="space-y-3">
            <h3 class="text-sm font-semibold text-gray-700">Tabla comparativa de etiquetas</h3>
            <p class="text-xs text-gray-700">
              Las filas resaltadas en
              <span class="inline-block w-3 h-3 rounded bg-violet-200 align-middle mx-0.5"></span>
              azul indican diferencias en la etiqueta asignada al mismo token segun el contexto oracional.
            </p>
            <div class="overflow-x-auto">
              <table class="min-w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th class="bg-[#04202C] text-white px-4 py-2.5 text-left font-semibold rounded-tl-lg">Token</th>
                    <th class="bg-[#04202C] text-white px-4 py-2.5 text-center font-semibold">Etiqueta Oracion 1</th>
                    <th class="bg-[#04202C] text-white px-4 py-2.5 text-center font-semibold">Descripcion EAGLES</th>
                    <th class="bg-[#04202C] text-white px-4 py-2.5 text-center font-semibold">Etiqueta Oracion 2</th>
                    <th class="bg-[#04202C] text-white px-4 py-2.5 text-center font-semibold rounded-tr-lg">Descripcion EAGLES</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of comparisonTable; track row.token) {
                  <tr class="border-b border-gray-100"
                      [class]="row.isDifferent ? 'bg-violet-50' : 'bg-white'">
                    <td class="px-4 py-2 font-semibold text-gray-800">{{ row.token }}</td>
                    <td class="px-4 py-2 text-center">
                      <span class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-[#04202C] border"
                            [style.background-color]="getTagBgColor(row.tagA)"
                            [style.border-color]="getTagColor(row.tagA) + '30'">
                        {{ row.tagA || '--' }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-center text-gray-800">{{ row.descA || '--' }}</td>
                    <td class="px-4 py-2 text-center">
                      <span class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-[#04202C] border"
                            [style.background-color]="getTagBgColor(row.tagB)"
                            [style.border-color]="getTagColor(row.tagB) + '30'">
                        {{ row.tagB || '--' }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-center text-gray-800">{{ row.descB || '--' }}</td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Resumen de diferencias -->
          @if (diffCount > 0) {
            <div class="flex items-center gap-2 p-3 rounded-lg bg-violet-50 border border-violet-200">
              <svg class="w-4 h-4 text-violet-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-xs text-violet-700 font-medium">
                Se encontraron {{ diffCount }} diferencia(s) en las etiquetas asignadas a los mismos tokens.
                Esto demuestra como el contexto oracional afecta las probabilidades de transicion del modelo HMM.
              </span>
            </div>
          }

          @if (diffCount === 0) {
            <div class="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-xs text-green-700 font-medium">
                Ambas oraciones produjeron las mismas etiquetas para los tokens compartidos.
              </span>
            </div>
          }
        </div>
        }

        <!-- Mensaje cuando aun no se ha etiquetado -->
        @if ((!resultA || !resultB) && !loadingA && !loadingB && !error) {
          <div class="text-center py-8 text-gray-800">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p class="text-sm">Pulsa <strong>Etiquetar ambas</strong> para comparar el etiquetado de las dos oraciones.</p>
          </div>
        }
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 2: EVALUACION CUANTITATIVA                           -->
      <!-- ============================================================ -->
      <div class="bg-white rounded-2xl shadow p-6 space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Evaluacion Cuantitativa del Modelo</h2>
            <p class="text-xs text-gray-700 mt-1">
              Train/test split sobre el corpus EAGLES, entrenamiento independiente y evaluacion con metricas estandar.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-700 whitespace-nowrap">Muestra:</label>
              <select [(ngModel)]="evalMaxSentences"
                      class="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800
                             focus:ring-2 focus:ring-[#04202C]/30 focus:border-[#04202C] outline-none">
                <option [ngValue]="500">500 oraciones (~5 seg)</option>
                <option [ngValue]="2000">2,000 oraciones (~20 seg)</option>
                <option [ngValue]="5000">5,000 oraciones (~1 min)</option>
                <option [ngValue]="10000">10,000 oraciones (~3 min)</option>
                <option [ngValue]="0">Corpus completo (lento)</option>
              </select>
            </div>
            <button
              (click)="runEvaluation()"
              [disabled]="loadingEval"
              class="rounded-lg bg-[#04202C] px-5 py-2.5 text-sm font-semibold text-white shadow
                     hover:bg-[#04202C]/90 transition disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2 whitespace-nowrap">
              @if (loadingEval) {
                <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Evaluando...
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                Ejecutar Evaluacion
            }
            </button>
          </div>
        </div>

        @if (evalError) {
          <div class="rounded-2xl bg-red-50 border border-red-200 p-4">
            <p class="text-sm text-red-700">{{ evalError }}</p>
          </div>
        }

        @if (loadingEval) {
          <div class="text-center py-8">
            <span class="inline-block w-8 h-8 border-3 border-[#04202C]/20 border-t-[#04202C] rounded-full animate-spin"></span>
            <p class="text-sm text-gray-700 mt-3">Procesando corpus y ejecutando evaluacion... esto puede tardar varios segundos.</p>
          </div>
        }

        @if (evalResult && !loadingEval) {
          <!-- Metricas globales -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="border border-gray-200 rounded-xl p-3 text-center">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-700">Accuracy</p>
              <p class="text-2xl font-bold text-[#04202C] mt-1">{{ (evalResult.global_metrics.accuracy * 100).toFixed(1) }}%</p>
            </div>
            <div class="border border-gray-200 rounded-xl p-3 text-center">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-700">F1 Weighted</p>
              <p class="text-2xl font-bold text-[#04202C] mt-1">{{ (evalResult.weighted_avg.f1_score * 100).toFixed(1) }}%</p>
            </div>
            <div class="border border-gray-200 rounded-xl p-3 text-center">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-700">Tokens Evaluados</p>
              <p class="text-2xl font-bold text-[#04202C] mt-1">{{ evalResult.global_metrics.total_tokens_evaluated.toLocaleString() }}</p>
            </div>
            <div class="border border-gray-200 rounded-xl p-3 text-center">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-700">Palabras OOV</p>
              <p class="text-2xl font-bold text-[#04202C] mt-1">{{ (evalResult.global_metrics.unknown_word_ratio * 100).toFixed(1) }}%</p>
            </div>
          </div>

          <!-- Split info + macro/weighted -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="border border-gray-200 rounded-xl p-3">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-700 mb-2">Split del Corpus</p>
              <div class="space-y-1 text-xs text-gray-800">
                <div class="flex justify-between"><span>Oraciones totales</span><span class="font-mono font-semibold">{{ evalResult.split.total_sentences.toLocaleString() }}</span></div>
                <div class="flex justify-between"><span>Entrenamiento</span><span class="font-mono font-semibold">{{ evalResult.split.train_sentences.toLocaleString() }}</span></div>
                <div class="flex justify-between"><span>Test</span><span class="font-mono font-semibold">{{ evalResult.split.test_sentences.toLocaleString() }}</span></div>
                <div class="flex justify-between"><span>Ratio test</span><span class="font-mono font-semibold">{{ evalResult.split.test_ratio }}</span></div>
              </div>
            </div>
            <div class="border border-gray-200 rounded-xl p-3">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-700 mb-2">Promedio Macro</p>
              <div class="space-y-1 text-xs text-gray-800">
                <div class="flex justify-between"><span>Precision</span><span class="font-mono font-semibold">{{ (evalResult.macro_avg.precision * 100).toFixed(2) }}%</span></div>
                <div class="flex justify-between"><span>Recall</span><span class="font-mono font-semibold">{{ (evalResult.macro_avg.recall * 100).toFixed(2) }}%</span></div>
                <div class="flex justify-between"><span>F1-Score</span><span class="font-mono font-semibold">{{ (evalResult.macro_avg.f1_score * 100).toFixed(2) }}%</span></div>
              </div>
            </div>
            <div class="border border-gray-200 rounded-xl p-3">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-700 mb-2">Promedio Weighted</p>
              <div class="space-y-1 text-xs text-gray-800">
                <div class="flex justify-between"><span>Precision</span><span class="font-mono font-semibold">{{ (evalResult.weighted_avg.precision * 100).toFixed(2) }}%</span></div>
                <div class="flex justify-between"><span>Recall</span><span class="font-mono font-semibold">{{ (evalResult.weighted_avg.recall * 100).toFixed(2) }}%</span></div>
                <div class="flex justify-between"><span>F1-Score</span><span class="font-mono font-semibold">{{ (evalResult.weighted_avg.f1_score * 100).toFixed(2) }}%</span></div>
              </div>
            </div>
          </div>

          <!-- Per-tag metrics table -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-700">Metricas por etiqueta</h3>
              <button (click)="showAllTags = !showAllTags" class="text-xs text-[#04202C] hover:underline">
                {{ showAllTags ? 'Mostrar top 20' : 'Mostrar todas (' + evalResult.per_tag_metrics.length + ')' }}
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th class="bg-[#04202C] text-white px-3 py-2 text-left font-semibold rounded-tl-lg">Etiqueta</th>
                    <th class="bg-[#04202C] text-white px-3 py-2 text-left font-semibold">Descripcion</th>
                    <th class="bg-[#04202C] text-white px-3 py-2 text-center font-semibold">Precision</th>
                    <th class="bg-[#04202C] text-white px-3 py-2 text-center font-semibold">Recall</th>
                    <th class="bg-[#04202C] text-white px-3 py-2 text-center font-semibold">F1</th>
                    <th class="bg-[#04202C] text-white px-3 py-2 text-center font-semibold rounded-tr-lg">Support</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of displayedTagMetrics; track m['tag']) {
                    <tr class="border-b border-gray-100 hover:bg-gray-50/50">
                      <td class="px-3 py-1.5">
                        <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-[#04202C] border"
                              [style.background-color]="getTagBgColor(m['tag'])"
                              [style.border-color]="getTagColor(m['tag']) + '30'">
                          {{ m['tag'] }}
                        </span>
                      </td>
                      <td class="px-3 py-1.5 text-gray-700 max-w-[200px] truncate">{{ m['description'] || m['category'] }}</td>
                      <td class="px-3 py-1.5 text-center font-mono">{{ (m['precision'] * 100).toFixed(1) }}%</td>
                      <td class="px-3 py-1.5 text-center font-mono">{{ (m['recall'] * 100).toFixed(1) }}%</td>
                      <td class="px-3 py-1.5 text-center font-mono font-semibold">{{ (m['f1_score'] * 100).toFixed(1) }}%</td>
                      <td class="px-3 py-1.5 text-center font-mono">{{ m['support'].toLocaleString() }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Confusion Matrix -->
          @if (evalResult.confusion_matrix && evalResult.confusion_matrix.tags.length > 0) {
            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-700">Matriz de Confusion (Top {{ evalResult.confusion_matrix.tags.length }} etiquetas)</h3>
              <div class="overflow-x-auto">
                <table class="text-[10px] border-collapse">
                  <thead>
                    <tr>
                      <th class="px-1.5 py-1 bg-gray-100 text-gray-700 font-semibold sticky left-0 z-10 min-w-[60px]">Real \\ Pred</th>
                      @for (tag of evalResult.confusion_matrix.tags; track tag) {
                        <th class="px-1.5 py-1 bg-gray-100 text-gray-700 font-mono text-center min-w-[44px]"
                            [style.writing-mode]="'vertical-rl'"
                            [style.transform]="'rotate(180deg)'">{{ tag }}</th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (trueTag of evalResult.confusion_matrix.tags; track trueTag) {
                      <tr>
                        <td class="px-1.5 py-1 bg-gray-100 font-mono font-semibold text-gray-700 sticky left-0 z-10">{{ trueTag }}</td>
                        @for (predTag of evalResult.confusion_matrix.tags; track predTag) {
                          <td class="px-1.5 py-1 text-center font-mono"
                              [style.background-color]="getConfusionCellColor(trueTag, predTag)"
                              [style.color]="getConfusionCellValue(trueTag, predTag) > 0 ? '#04202C' : '#d1d5db'">
                            {{ getConfusionCellValue(trueTag, predTag) || '' }}
                          </td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Sentence accuracy distribution -->
          @if (evalResult.sentence_accuracy_distribution) {
            <div class="border border-gray-200 rounded-xl p-3">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-700 mb-2">Accuracy por Oracion</p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-800">
                <div class="flex justify-between"><span>Media</span><span class="font-mono font-semibold">{{ (evalResult.sentence_accuracy_distribution.mean * 100).toFixed(1) }}%</span></div>
                <div class="flex justify-between"><span>Minima</span><span class="font-mono font-semibold">{{ (evalResult.sentence_accuracy_distribution.min * 100).toFixed(1) }}%</span></div>
                <div class="flex justify-between"><span>Maxima</span><span class="font-mono font-semibold">{{ (evalResult.sentence_accuracy_distribution.max * 100).toFixed(1) }}%</span></div>
                <div class="flex justify-between"><span>Oraciones</span><span class="font-mono font-semibold">{{ evalResult.sentence_accuracy_distribution.total_sentences_evaluated.toLocaleString() }}</span></div>
              </div>
            </div>
          }
        }

        @if (!evalResult && !loadingEval && !evalError) {
          <div class="text-center py-6 text-gray-800">
            <svg class="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <p class="text-sm">Pulsa <strong>Ejecutar Evaluacion</strong> para realizar train/test split y obtener metricas.</p>
          </div>
        }
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 3: PREGUNTAS Y RESPUESTAS                            -->
      <!-- ============================================================ -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">Preguntas y Respuestas</h2>
        <p class="text-xs text-gray-700">
          Respuestas razonadas a las preguntas del apartado 3 de la actividad.
        </p>

        @if (loadingQuestions) {
          <div class="text-center py-6">
            <span class="inline-block w-6 h-6 border-2 border-[#04202C]/20 border-t-[#04202C] rounded-full animate-spin"></span>
            <p class="text-xs text-gray-700 mt-2">Cargando preguntas...</p>
          </div>
        }

        @if (questionsError) {
          <div class="rounded-2xl bg-red-50 border border-red-200 p-4">
            <p class="text-sm text-red-700">{{ questionsError }}</p>
          </div>
        }

        @if (!loadingQuestions && !questionsError && questions.length === 0) {
          <div class="text-center py-6 text-gray-800">
            <p class="text-sm">No hay preguntas cargadas en la base de datos.</p>
          </div>
        }

        @for (q of questions; track q.id; let i = $index) {
          <div class="bg-white rounded-2xl shadow overflow-hidden">
            <button
              (click)="toggleQuestion(i)"
              class="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-gray-50 transition">
              <div class="flex items-center gap-3">
                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-[#04202C] text-white text-sm font-bold shrink-0">{{ i + 1 }}</span>
                <span class="text-sm font-semibold text-gray-800">{{ q.question }}</span>
              </div>
              <svg class="w-5 h-5 text-gray-700 transition-transform duration-200 shrink-0"
                   [class.rotate-180]="expandedQuestions[i]"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            @if (expandedQuestions[i]) {
              <div class="px-4 sm:px-6 pb-5 border-t border-gray-100 pt-4">
                <div class="prose prose-sm max-w-none text-gray-700 space-y-3" [innerHTML]="q.answer_html"></div>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class AnalysisComponent {

  // ── Oraciones (loaded from API, fallbacks) ───────────
  sentenceA = 'Habla con el enfermo grave de trasplantes.';
  sentenceB = 'El enfermo grave habla de trasplantes.';

  // ── Estado etiquetado ────────────────────────────────
  loadingA = false;
  loadingB = false;
  error: string | null = null;

  resultA: ViterbiResult | null = null;
  resultB: ViterbiResult | null = null;

  // Tabla comparativa
  comparisonTable: {
    token: string;
    tagA: string | null;
    descA: string | null;
    tagB: string | null;
    descB: string | null;
    isDifferent: boolean;
  }[] = [];
  diffCount = 0;

  // ── Preguntas (loaded from API) ──────────────────────
  questions: AnalysisQuestion[] = [];
  expandedQuestions: boolean[] = [];
  loadingQuestions = false;
  questionsError: string | null = null;

  // ── Evaluacion ───────────────────────────────────────
  evalResult: EvaluationResult | null = null;
  loadingEval = false;
  evalError: string | null = null;
  showAllTags = false;
  evalMaxSentences = 500;

  // Mapa de colores para familias de etiquetas EAGLES
  private tagColorMap: Record<string, string> = {};
  private confusionMaxValue = 1;

  constructor(private apiService: ApiService) {
    this.loadConfig();
  }

  private loadConfig(): void {
    this.apiService.getTagColors().subscribe({
      next: (colors) => { this.tagColorMap = colors; },
      error: () => {},
    });

    // Load sentences from API (use first 2 quick_sentences)
    this.apiService.getQuickSentences().subscribe({
      next: (res) => {
        if (res.sentences.length >= 1) this.sentenceA = res.sentences[0].sentence;
        if (res.sentences.length >= 2) this.sentenceB = res.sentences[1].sentence;
      },
      error: () => {},
    });

    // Load Q&A from API
    this.loadingQuestions = true;
    this.apiService.getAnalysisQuestions().subscribe({
      next: (res) => {
        this.questions = res.questions;
        // First question expanded by default so user sees content immediately
        this.expandedQuestions = res.questions.map((_, i) => i === 0);
        this.loadingQuestions = false;
      },
      error: (err) => {
        console.error('Error loading analysis questions:', err);
        this.questionsError = 'No se pudieron cargar las preguntas desde la base de datos.';
        this.loadingQuestions = false;
      },
    });
  }

  // ── Acciones de etiquetado ─────────────────────────────

  tagSentenceA(): void {
    if (this.resultA) {
      this.resultA = null;
      this.buildComparisonTable();
      return;
    }
    this.loadingA = true;
    this.error = null;
    this.apiService.tagSentence(this.sentenceA).subscribe({
      next: (res) => {
        this.resultA = res;
        this.loadingA = false;
        this.buildComparisonTable();
      },
      error: (err) => {
        this.error = err?.error?.detail ?? err?.error?.message ?? err?.message ?? 'Error al etiquetar la oracion 1.';
        this.loadingA = false;
      },
    });
  }

  tagSentenceB(): void {
    if (this.resultB) {
      this.resultB = null;
      this.buildComparisonTable();
      return;
    }
    this.loadingB = true;
    this.error = null;
    this.apiService.tagSentence(this.sentenceB).subscribe({
      next: (res) => {
        this.resultB = res;
        this.loadingB = false;
        this.buildComparisonTable();
      },
      error: (err) => {
        this.error = err?.error?.detail ?? err?.error?.message ?? err?.message ?? 'Error al etiquetar la oracion 2.';
        this.loadingB = false;
      },
    });
  }

  tagBoth(): void {
    if (this.resultA && this.resultB) {
      this.resultA = null;
      this.resultB = null;
      this.buildComparisonTable();
      return;
    }
    // Force-tag both (reset first so individual toggles don't short-circuit)
    this.resultA = null;
    this.resultB = null;
    this.loadingA = true;
    this.loadingB = true;
    this.error = null;
    this.apiService.tagSentence(this.sentenceA).subscribe({
      next: (res) => { this.resultA = res; this.loadingA = false; this.buildComparisonTable(); },
      error: (err) => { this.error = err?.error?.detail ?? err?.message ?? 'Error al etiquetar oracion 1.'; this.loadingA = false; },
    });
    this.apiService.tagSentence(this.sentenceB).subscribe({
      next: (res) => { this.resultB = res; this.loadingB = false; this.buildComparisonTable(); },
      error: (err) => { this.error = err?.error?.detail ?? err?.message ?? 'Error al etiquetar oracion 2.'; this.loadingB = false; },
    });
  }

  // ── Preguntas ──────────────────────────────────────────

  toggleQuestion(index: number): void {
    this.expandedQuestions[index] = !this.expandedQuestions[index];
  }

  // ── Evaluacion ─────────────────────────────────────────

  runEvaluation(): void {
    this.loadingEval = true;
    this.evalError = null;
    this.evalResult = null;
    this.apiService.runEvaluation({ max_sentences: this.evalMaxSentences || undefined }).subscribe({
      next: (res) => {
        this.evalResult = res;
        this.loadingEval = false;
        this.computeConfusionMax();
      },
      error: (err) => {
        this.evalError = err?.error?.detail ?? err?.error?.message ?? err?.message ?? 'Error al ejecutar la evaluacion.';
        this.loadingEval = false;
      },
    });
  }

  get displayedTagMetrics(): Record<string, any>[] {
    if (!this.evalResult) return [];
    return this.showAllTags ? this.evalResult.per_tag_metrics : this.evalResult.per_tag_metrics.slice(0, 20);
  }

  private computeConfusionMax(): void {
    if (!this.evalResult?.confusion_matrix?.matrix) return;
    let max = 1;
    for (const row of Object.values(this.evalResult.confusion_matrix.matrix)) {
      for (const val of Object.values(row)) {
        if (val > max) max = val;
      }
    }
    this.confusionMaxValue = max;
  }

  getConfusionCellValue(trueTag: string, predTag: string): number {
    return this.evalResult?.confusion_matrix?.matrix?.[trueTag]?.[predTag] ?? 0;
  }

  getConfusionCellColor(trueTag: string, predTag: string): string {
    const val = this.getConfusionCellValue(trueTag, predTag);
    if (val === 0) return 'transparent';
    if (trueTag === predTag) {
      // Diagonal = correct predictions: green tones
      const intensity = Math.min(val / this.confusionMaxValue, 1);
      const alpha = 0.1 + intensity * 0.5;
      return `rgba(34, 197, 94, ${alpha})`;
    }
    // Off-diagonal = errors: red tones
    const intensity = Math.min(val / (this.confusionMaxValue * 0.3), 1);
    const alpha = 0.08 + intensity * 0.4;
    return `rgba(239, 68, 68, ${alpha})`;
  }

  // ── Comparacion ────────────────────────────────────────

  private buildComparisonTable(): void {
    this.comparisonTable = [];
    this.diffCount = 0;

    if (!this.resultA || !this.resultB) return;

    const mapA = new Map<string, { tag: string; desc: string }>();
    const mapB = new Map<string, { tag: string; desc: string }>();

    this.resultA.tokens.forEach((t, i) => {
      mapA.set(t.toLowerCase(), { tag: this.resultA!.tags[i], desc: this.resultA!.descriptions[i] || '' });
    });

    this.resultB.tokens.forEach((t, i) => {
      mapB.set(t.toLowerCase(), { tag: this.resultB!.tags[i], desc: this.resultB!.descriptions[i] || '' });
    });

    const seen = new Set<string>();
    const orderedTokens: string[] = [];

    for (const t of this.resultA.tokens) {
      const lc = t.toLowerCase();
      if (!seen.has(lc)) {
        seen.add(lc);
        orderedTokens.push(t);
      }
    }
    for (const t of this.resultB.tokens) {
      const lc = t.toLowerCase();
      if (!seen.has(lc)) {
        seen.add(lc);
        orderedTokens.push(t);
      }
    }

    for (const token of orderedTokens) {
      const lc = token.toLowerCase();
      const a = mapA.get(lc);
      const b = mapB.get(lc);
      const isDifferent = !!(a && b && a.tag !== b.tag);
      if (isDifferent) this.diffCount++;

      this.comparisonTable.push({
        token,
        tagA: a?.tag ?? null,
        descA: a?.desc ?? null,
        tagB: b?.tag ?? null,
        descB: b?.desc ?? null,
        isDifferent,
      });
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

  // ── Utilidades ─────────────────────────────────────────

  getTagColor(tag: string | null | undefined): string {
    if (!tag || tag.length === 0) return '#9ca3af';
    const family = tag.charAt(0).toUpperCase();
    return this.tagColorMap[family] ?? '#9ca3af';
  }

  getTagBgColor(tag: string | null | undefined): string {
    const hex = this.getTagColor(tag);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  }

  formatScientific(value: number | null | undefined): string {
    if (value === null || value === undefined) return '--';
    if (value === 0) return '0.00e+0';
    return value.toExponential(2);
  }
}
