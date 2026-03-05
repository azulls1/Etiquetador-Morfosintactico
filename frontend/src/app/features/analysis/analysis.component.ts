import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ViterbiResult } from '../../core/models/viterbi.model';

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
        <h1 class="text-2xl font-bold text-[#2F5496] dark:text-blue-300">Parte 3: Analisis Comparativo y Preguntas</h1>
        <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">
          Analisis del etiquetado morfosintactico de las oraciones requeridas, evaluacion de resultados,
          limitaciones del etiquetador HMM y propuestas de mejora.
        </p>
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 1: ETIQUETADO COMPARATIVO                            -->
      <!-- ============================================================ -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Etiquetado comparativo</h2>
        <p class="text-xs text-gray-500 dark:text-gray-300">
          Etiqueta ambas oraciones para comparar como el contexto (orden de palabras) afecta las probabilidades
          de transicion y, por tanto, las etiquetas asignadas por el algoritmo de Viterbi.
        </p>

        <!-- Botones para etiquetar -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            (click)="tagSentenceA()"
            [disabled]="loadingA"
            class="flex-1 rounded-lg border-2 border-[#2F5496] dark:border-blue-400 px-5 py-3 text-sm font-semibold transition
                   disabled:opacity-50 disabled:cursor-not-allowed"
            [class]="resultA ? 'bg-[#2F5496] text-white' : 'bg-white dark:bg-gray-700 text-[#2F5496] dark:text-blue-300 dark:text-blue-300 hover:bg-[#2F5496]/10 dark:bg-blue-500/15'">
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
            class="flex-1 rounded-lg border-2 border-[#2F5496] dark:border-blue-400 px-5 py-3 text-sm font-semibold transition
                   disabled:opacity-50 disabled:cursor-not-allowed"
            [class]="resultB ? 'bg-[#2F5496] text-white' : 'bg-white dark:bg-gray-700 text-[#2F5496] dark:text-blue-300 dark:text-blue-300 hover:bg-[#2F5496]/10 dark:bg-blue-500/15'">
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
            class="rounded-lg bg-[#2F5496] px-5 py-3 text-sm font-semibold text-white shadow
                   hover:bg-[#244078] transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
            Etiquetar ambas
          </button>
        </div>

        <!-- Spinner -->
        <app-loading-spinner [loading]="loadingA || loadingB" message="Ejecutando algoritmo de Viterbi..."></app-loading-spinner>

        <!-- Error -->
        @if (error) {
          <div class="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
            </div>
          </div>
        }

        <!-- Resultados lado a lado -->
        @if (resultA && resultB && !loadingA && !loadingB) {
        <div class="space-y-5">

          <!-- Comparacion visual -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Oracion A -->
            <div class="space-y-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300 dark:text-blue-300">Oracion 1</h3>
              <p class="text-xs text-gray-500 dark:text-gray-300 italic">&laquo;{{ resultA.sentence }}&raquo;</p>
              <div class="flex flex-wrap gap-2">
                @for (token of resultA.tokens; track $index; let i = $index) {
                  <div
                    class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 border"
                    [class]="isDifferentTag(token, resultA.tags[i], 'A') ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'">
                    <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ token }}</span>
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      [style.background-color]="getTagColor(resultA.tags[i])">
                      {{ resultA.tags[i] }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-300 text-center max-w-[120px] leading-tight">
                      {{ resultA.descriptions[i] }}
                    </span>
                  </div>
                }
              </div>
              <p class="text-xs font-mono text-gray-400 dark:text-gray-300">
                P(mejor camino) = {{ formatScientific(resultA.best_path_prob) }}
              </p>
            </div>

            <!-- Oracion B -->
            <div class="space-y-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 class="text-sm font-semibold text-[#2F5496] dark:text-blue-300 dark:text-blue-300">Oracion 2</h3>
              <p class="text-xs text-gray-500 dark:text-gray-300 italic">&laquo;{{ resultB.sentence }}&raquo;</p>
              <div class="flex flex-wrap gap-2">
                @for (token of resultB.tokens; track $index; let i = $index) {
                  <div
                    class="flex flex-col items-center gap-1 rounded-lg px-3 py-2 border"
                    [class]="isDifferentTag(token, resultB.tags[i], 'B') ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'">
                    <span class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ token }}</span>
                    <span
                      class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      [style.background-color]="getTagColor(resultB.tags[i])">
                      {{ resultB.tags[i] }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-300 text-center max-w-[120px] leading-tight">
                      {{ resultB.descriptions[i] }}
                    </span>
                  </div>
                }
              </div>
              <p class="text-xs font-mono text-gray-400 dark:text-gray-300">
                P(mejor camino) = {{ formatScientific(resultB.best_path_prob) }}
              </p>
            </div>
          </div>

          <!-- Tabla de diferencias -->
          <div class="space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tabla comparativa de etiquetas</h3>
            <p class="text-xs text-gray-500 dark:text-gray-300">
              Las filas resaltadas en
              <span class="inline-block w-3 h-3 rounded bg-blue-200 dark:bg-blue-700 align-middle mx-0.5"></span>
              azul indican diferencias en la etiqueta asignada al mismo token segun el contexto oracional.
            </p>
            <div class="overflow-x-auto">
              <table class="min-w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th class="bg-[#2F5496] text-white px-4 py-2.5 text-left font-semibold rounded-tl-lg">Token</th>
                    <th class="bg-[#2F5496] text-white px-4 py-2.5 text-center font-semibold">Etiqueta Oracion 1</th>
                    <th class="bg-[#2F5496] text-white px-4 py-2.5 text-center font-semibold">Descripcion EAGLES</th>
                    <th class="bg-[#2F5496] text-white px-4 py-2.5 text-center font-semibold">Etiqueta Oracion 2</th>
                    <th class="bg-[#2F5496] text-white px-4 py-2.5 text-center font-semibold rounded-tr-lg">Descripcion EAGLES</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of comparisonTable; track row.token) {
                  <tr class="border-b border-gray-100 dark:border-gray-700"
                      [class]="row.isDifferent ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'">
                    <td class="px-4 py-2 font-semibold text-gray-800 dark:text-gray-100">{{ row.token }}</td>
                    <td class="px-4 py-2 text-center">
                      <span class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            [style.background-color]="getTagColor(row.tagA)">
                        {{ row.tagA || '--' }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-center text-gray-600 dark:text-gray-300">{{ row.descA || '--' }}</td>
                    <td class="px-4 py-2 text-center">
                      <span class="inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                            [style.background-color]="getTagColor(row.tagB)">
                        {{ row.tagB || '--' }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-center text-gray-600 dark:text-gray-300">{{ row.descB || '--' }}</td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Resumen de diferencias -->
          @if (diffCount > 0) {
            <div class="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <svg class="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Se encontraron {{ diffCount }} diferencia(s) en las etiquetas asignadas a los mismos tokens.
                Esto demuestra como el contexto oracional afecta las probabilidades de transicion del modelo HMM.
              </span>
            </div>
          }

          @if (diffCount === 0) {
            <div class="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-xs text-green-700 dark:text-green-300 font-medium">
                Ambas oraciones produjeron las mismas etiquetas para los tokens compartidos.
              </span>
            </div>
          }
        </div>
        }

        <!-- Mensaje cuando aun no se ha etiquetado -->
        @if ((!resultA || !resultB) && !loadingA && !loadingB && !error) {
          <div class="text-center py-8 text-gray-400 dark:text-gray-300">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p class="text-sm">Pulsa <strong>Etiquetar ambas</strong> para comparar el etiquetado de las dos oraciones.</p>
          </div>
        }
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 2: PREGUNTAS Y RESPUESTAS                            -->
      <!-- ============================================================ -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Preguntas y Respuestas</h2>
        <p class="text-xs text-gray-500 dark:text-gray-300">
          Respuestas razonadas a las preguntas del apartado 3 de la actividad.
        </p>

        <!-- Pregunta 1 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
          <button
            (click)="toggleQuestion(0)"
            class="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-[#2F5496] text-white text-sm font-bold shrink-0">1</span>
              <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Es correcto el etiquetado de &laquo;Habla con el enfermo grave de trasplantes.&raquo;?
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-300 transition-transform duration-200 shrink-0"
                 [class.rotate-180]="expandedQuestions[0]"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          @if (expandedQuestions[0]) {
          <div class="px-4 sm:px-6 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-3">
              <p>
                El etiquetado producido por el modelo HMM con algoritmo de Viterbi para esta oracion es, en general,
                <strong>correcto</strong>, aunque presenta ciertos casos de ambiguedad que merecen analisis detallado:
              </p>
              <ul class="list-disc pl-5 space-y-2">
                <li>
                  <strong>&laquo;Habla&raquo;</strong>: Es una palabra ambigua. Puede ser un <em>verbo</em>
                  (VMIP3S0 - verbo principal, indicativo, presente, 3ra persona singular) o un <em>sustantivo femenino</em>
                  (NCFS000 - nombre comun, femenino, singular). En esta oracion, al estar en posicion inicial y seguida
                  de la preposicion &laquo;con&raquo;, el modelo HMM tiende a asignar la etiqueta verbal (VMIP3S0),
                  lo cual es correcto dado que &laquo;Habla&raquo; actua como verbo principal de la oracion
                  (imperativo o indicativo 3ra persona).
                </li>
                <li>
                  <strong>&laquo;con&raquo;</strong>: Preposicion (SPS00). Etiquetado correcto sin ambiguedad significativa.
                </li>
                <li>
                  <strong>&laquo;el&raquo;</strong>: Articulo determinado masculino singular (DA0MS0). Correcto.
                </li>
                <li>
                  <strong>&laquo;enfermo&raquo;</strong>: Palabra ambigua. Puede ser <em>adjetivo</em> (AQ0MS0 - adjetivo
                  calificativo, masculino, singular) o <em>sustantivo</em> (NCMS000 - nombre comun, masculino, singular).
                  Tras el articulo &laquo;el&raquo;, el modelo probablemente lo etiqueta como sustantivo (NCMS000),
                  lo cual es correcto en este contexto ya que &laquo;el enfermo&raquo; funciona como sintagma nominal
                  (sustantivacion del adjetivo).
                </li>
                <li>
                  <strong>&laquo;grave&raquo;</strong>: Adjetivo calificativo (AQ0CS0). Correcto. Modifica al sustantivo
                  &laquo;enfermo&raquo;. La posicion postnominal refuerza su funcion adjetival.
                </li>
                <li>
                  <strong>&laquo;de&raquo;</strong>: Preposicion (SPS00). Correcto.
                </li>
                <li>
                  <strong>&laquo;trasplantes&raquo;</strong>: Sustantivo comun masculino plural (NCMP000). Correcto.
                  Aunque el verbo &laquo;trasplantar&raquo; tiene formas que coinciden, en posicion pospreposicional es
                  inequivocamente un sustantivo.
                </li>
                <li>
                  <strong>&laquo;.&raquo;</strong>: Signo de puntuacion (Fp). Correcto.
                </li>
              </ul>
              <p>
                <strong>Conclusion:</strong> El modelo HMM asigna correctamente las etiquetas gracias a que las
                probabilidades de transicion de bigramas capturan patrones sintacticos como
                &laquo;preposicion &rarr; articulo&raquo;, &laquo;articulo &rarr; sustantivo&raquo; y
                &laquo;sustantivo &rarr; adjetivo&raquo;, resolviendo adecuadamente las ambiguedades contextuales.
              </p>
            </div>
          </div>
          }
        </div>

        <!-- Pregunta 2 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
          <button
            (click)="toggleQuestion(1)"
            class="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-[#2F5496] text-white text-sm font-bold shrink-0">2</span>
              <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Etiqueta &laquo;El enfermo grave habla de trasplantes.&raquo; y evalua si es correcto
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-300 transition-transform duration-200 shrink-0"
                 [class.rotate-180]="expandedQuestions[1]"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          @if (expandedQuestions[1]) {
          <div class="px-4 sm:px-6 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-3">
              <p>
                Esta oracion contiene las <strong>mismas palabras</strong> que la anterior pero en un
                <strong>orden diferente</strong>. El cambio de orden sintactico altera las probabilidades de
                transicion del modelo HMM y puede producir etiquetas distintas para los mismos tokens:
              </p>
              <ul class="list-disc pl-5 space-y-2">
                <li>
                  <strong>&laquo;El&raquo;</strong>: Articulo determinado masculino singular (DA0MS0). Correcto.
                  Al estar en posicion inicial, la probabilidad de transicion desde el estado inicial favorece
                  fuertemente la etiqueta de articulo.
                </li>
                <li>
                  <strong>&laquo;enfermo&raquo;</strong>: Tras el articulo &laquo;El&raquo;, la transicion
                  &laquo;DA0MS0 &rarr; NCMS000&raquo; (articulo &rarr; sustantivo) tiene alta probabilidad.
                  El modelo deberia asignar NCMS000 (sustantivo), lo cual es correcto: &laquo;el enfermo&raquo;
                  es el sujeto de la oracion.
                </li>
                <li>
                  <strong>&laquo;grave&raquo;</strong>: Adjetivo calificativo (AQ0CS0). La transicion
                  &laquo;NCMS000 &rarr; AQ0CS0&raquo; (sustantivo &rarr; adjetivo) es natural. Correcto.
                </li>
                <li>
                  <strong>&laquo;habla&raquo;</strong>: En esta posicion, despues de un adjetivo, la transicion
                  &laquo;AQ0CS0 &rarr; VMIP3S0&raquo; (adjetivo &rarr; verbo) favorece la etiqueta verbal.
                  &laquo;habla&raquo; funciona aqui como el verbo principal de la oracion. El modelo deberia
                  asignar VMIP3S0, lo cual es correcto.
                </li>
                <li>
                  <strong>&laquo;de&raquo;</strong>: Preposicion (SPS00). Correcto.
                </li>
                <li>
                  <strong>&laquo;trasplantes&raquo;</strong>: Sustantivo comun masculino plural (NCMP000). Correcto.
                </li>
                <li>
                  <strong>&laquo;.&raquo;</strong>: Signo de puntuacion (Fp). Correcto.
                </li>
              </ul>
              <p>
                <strong>Comparacion clave:</strong> Aunque ambas oraciones comparten las mismas palabras, el cambio
                de orden puede afectar la etiqueta de &laquo;Habla/habla&raquo; y &laquo;enfermo&raquo;.
                En la primera oracion, &laquo;Habla&raquo; en posicion inicial recibe su etiqueta influida
                por la probabilidad inicial del modelo. En la segunda, &laquo;habla&raquo; recibe su etiqueta
                influida por la transicion desde el adjetivo &laquo;grave&raquo;.
                Las probabilidades de transicion de bigramas cambian segun el contexto inmediato,
                demostrando la dependencia del modelo HMM respecto al orden de las palabras.
              </p>
            </div>
          </div>
          }
        </div>

        <!-- Pregunta 3 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
          <button
            (click)="toggleQuestion(2)"
            class="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-[#2F5496] text-white text-sm font-bold shrink-0">3</span>
              <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Cuales son las limitaciones del etiquetador?
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-300 transition-transform duration-200 shrink-0"
                 [class.rotate-180]="expandedQuestions[2]"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          @if (expandedQuestions[2]) {
          <div class="px-4 sm:px-6 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-3">
              <p>
                El etiquetador basado en HMM con algoritmo de Viterbi presenta las siguientes
                <strong>limitaciones</strong>:
              </p>
              <ul class="list-disc pl-5 space-y-2">
                <li>
                  <strong>Contexto limitado a bigramas:</strong> El modelo de Markov de primer orden solo
                  considera la etiqueta inmediatamente anterior para determinar la etiqueta actual.
                  Esto impide capturar dependencias a larga distancia (por ejemplo, la concordancia
                  sujeto-verbo cuando hay subordinadas intercaladas).
                </li>
                <li>
                  <strong>Dependencia del corpus de entrenamiento:</strong> La calidad del etiquetado
                  depende directamente del tamano, dominio y calidad de las anotaciones del corpus EAGLES
                  utilizado. Un corpus pequeno o sesgado hacia un dominio especifico generara probabilidades
                  poco representativas del idioma general.
                </li>
                <li>
                  <strong>Manejo deficiente de palabras desconocidas:</strong> Las palabras que no aparecen
                  en el corpus de entrenamiento (out-of-vocabulary, OOV) no tienen probabilidades de emision
                  calculadas. El modelo debe recurrir a heuristicas simples (como asignar probabilidad
                  uniforme), lo que degrada significativamente la precision.
                </li>
                <li>
                  <strong>Ausencia de analisis morfologico:</strong> El modelo no analiza la estructura
                  interna de las palabras (prefijos, sufijos, flexiones). No puede inferir, por ejemplo,
                  que una palabra terminada en &laquo;-mente&raquo; es probablemente un adverbio, o que
                  &laquo;-cion&raquo; indica un sustantivo.
                </li>
                <li>
                  <strong>Sensibilidad a mayusculas y minusculas:</strong> El modelo diferencia entre
                  &laquo;Habla&raquo; y &laquo;habla&raquo;, lo que puede causar que la misma palabra
                  tenga diferentes probabilidades de emision segun su capitalizacion, especialmente
                  relevante al inicio de oracion.
                </li>
                <li>
                  <strong>Sin comprension semantica:</strong> El modelo no entiende el significado de las
                  palabras. Dos oraciones con la misma estructura sintactica pero significados muy diferentes
                  recibiran etiquetas identicas. No puede resolver ambiguedades que requieren conocimiento
                  del mundo.
                </li>
                <li>
                  <strong>Dispersión de datos (data sparsity):</strong> Muchas combinaciones de
                  bigramas de etiquetas pueden no aparecer en el corpus de entrenamiento, generando
                  probabilidades de transicion nulas que bloquean caminos potencialmente correctos
                  en el algoritmo de Viterbi.
                </li>
                <li>
                  <strong>Suposicion de independencia de las emisiones:</strong> El modelo HMM asume que
                  la probabilidad de observar una palabra depende unicamente de su etiqueta, no de las
                  palabras circundantes. Esto es una simplificacion que no refleja la realidad del lenguaje.
                </li>
              </ul>
            </div>
          </div>
          }
        </div>

        <!-- Pregunta 4 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
          <button
            (click)="toggleQuestion(3)"
            class="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
            <div class="flex items-center gap-3">
              <span class="flex items-center justify-center w-8 h-8 rounded-full bg-[#2F5496] text-white text-sm font-bold shrink-0">4</span>
              <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Que mejoras se podrian aplicar?
              </span>
            </div>
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-300 transition-transform duration-200 shrink-0"
                 [class.rotate-180]="expandedQuestions[3]"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          @if (expandedQuestions[3]) {
          <div class="px-4 sm:px-6 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-3">
              <p>
                Para superar las limitaciones identificadas, se podrian aplicar las siguientes <strong>mejoras</strong>:
              </p>
              <ul class="list-disc pl-5 space-y-2">
                <li>
                  <strong>Modelos de trigramas o n-gramas superiores:</strong> Extender el modelo de Markov
                  a segundo o tercer orden para considerar 2 o 3 etiquetas anteriores en las probabilidades
                  de transicion. Esto permite capturar patrones sintacticos mas complejos como
                  &laquo;Det + Adj + Nombre&raquo; o &laquo;Nombre + Prep + Nombre&raquo;, mejorando
                  la resolucion de ambiguedades.
                </li>
                <li>
                  <strong>Tecnicas de suavizado (smoothing):</strong>
                  <ul class="list-disc pl-5 mt-1 space-y-1">
                    <li><em>Suavizado de Laplace (add-one):</em> Anadir una pseudocuenta a todas las combinaciones
                    para evitar probabilidades nulas.</li>
                    <li><em>Good-Turing:</em> Redistribuir la masa de probabilidad de eventos frecuentes
                    hacia eventos no observados.</li>
                    <li><em>Interpolacion de Jelinek-Mercer:</em> Combinar modelos de diferente orden
                    (unigramas, bigramas, trigramas) con pesos optimizados.</li>
                    <li><em>Backoff de Katz:</em> Usar modelos de orden inferior cuando las estimaciones
                    de orden superior no son confiables.</li>
                  </ul>
                </li>
                <li>
                  <strong>Manejo de palabras desconocidas basado en sufijos:</strong> Implementar un
                  clasificador morfologico que analice los sufijos de las palabras desconocidas para estimar
                  su categoria gramatical. Por ejemplo, asignar mayor probabilidad de sustantivo a palabras
                  terminadas en &laquo;-cion&raquo;, &laquo;-miento&raquo;, &laquo;-dad&raquo;; y mayor
                  probabilidad de adverbio a las terminadas en &laquo;-mente&raquo;.
                </li>
                <li>
                  <strong>Corpus mas grande y/o especifico del dominio:</strong> Entrenar con corpus mas
                  extensos (como AnCora o corpus periodisticos) que proporcionen mayor cobertura lexica y
                  mejores estimaciones de probabilidad. Para aplicaciones especializadas, incorporar corpus
                  del dominio especifico (medico, juridico, tecnico).
                </li>
                <li>
                  <strong>Modelos CRF (Campos Aleatorios Condicionales):</strong> Reemplazar el HMM por un
                  CRF que permita incorporar multiples caracteristicas (features) de la palabra y su contexto:
                  prefijos, sufijos, capitalizacion, posicion en la oracion, palabras vecinas, etc.
                  Los CRF no requieren la suposicion de independencia de las emisiones.
                </li>
                <li>
                  <strong>Modelos basados en redes neuronales:</strong> Utilizar arquitecturas modernas como:
                  <ul class="list-disc pl-5 mt-1 space-y-1">
                    <li><em>BiLSTM-CRF:</em> Redes recurrentes bidireccionales con capa CRF, que capturan
                    contexto tanto hacia adelante como hacia atras.</li>
                    <li><em>Transformers:</em> Modelos como BERT o RoBERTa preentrenados en espanol que
                    ofrecen representaciones contextualizadas de alta calidad.</li>
                  </ul>
                </li>
                <li>
                  <strong>Metodos de ensamble (ensemble):</strong> Combinar las predicciones de multiples
                  modelos (HMM, CRF, redes neuronales) mediante votacion o apilamiento para obtener
                  etiquetados mas robustos que los de cualquier modelo individual.
                </li>
                <li>
                  <strong>Normalizacion de texto:</strong> Preprocesar el texto para normalizar mayusculas,
                  acentos y signos de puntuacion antes del etiquetado, reduciendo la variabilidad artificial
                  causada por diferencias superficiales.
                </li>
              </ul>
            </div>
          </div>
          }
        </div>
      </div>

    </div>
  `
})
export class AnalysisComponent {

  // ── Oraciones ──────────────────────────────────────────
  readonly sentenceA = 'Habla con el enfermo grave de trasplantes.';
  readonly sentenceB = 'El enfermo grave habla de trasplantes.';

  // ── Estado ─────────────────────────────────────────────
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

  // Preguntas expandidas
  expandedQuestions: boolean[] = [false, false, false, false];

  // Mapa de colores para familias de etiquetas EAGLES
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

  constructor(private apiService: ApiService) {}

  // ── Acciones de etiquetado ─────────────────────────────

  tagSentenceA(): void {
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
    this.tagSentenceA();
    this.tagSentenceB();
  }

  // ── Preguntas ──────────────────────────────────────────

  toggleQuestion(index: number): void {
    this.expandedQuestions[index] = !this.expandedQuestions[index];
  }

  // ── Comparacion ────────────────────────────────────────

  private buildComparisonTable(): void {
    this.comparisonTable = [];
    this.diffCount = 0;

    if (!this.resultA || !this.resultB) return;

    // Build maps: lowercase token -> {tag, desc} for each result
    const mapA = new Map<string, { tag: string; desc: string }>();
    const mapB = new Map<string, { tag: string; desc: string }>();

    this.resultA.tokens.forEach((t, i) => {
      mapA.set(t.toLowerCase(), { tag: this.resultA!.tags[i], desc: this.resultA!.descriptions[i] || '' });
    });

    this.resultB.tokens.forEach((t, i) => {
      mapB.set(t.toLowerCase(), { tag: this.resultB!.tags[i], desc: this.resultB!.descriptions[i] || '' });
    });

    // Collect all unique tokens preserving order from sentence A first, then B
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

  /** Checks if a token has a different tag in the other sentence result. */
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

  formatScientific(value: number | null | undefined): string {
    if (value === null || value === undefined) return '--';
    if (value === 0) return '0.00e+0';
    return value.toExponential(2);
  }
}
