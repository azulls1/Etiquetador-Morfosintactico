import { Component, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { CorpusStats, CorpusSearchResult } from '../../core/models/corpus.model';
import { ViterbiResult, TagDescription, AnalysisQuestion, ExportChecklistItem } from '../../core/models/viterbi.model';

@Component({
  selector: 'app-informe',
  standalone: true,
  imports: [],
  template: `
    <!-- ── Loading ──────────────────────────────────────── -->
    @if (loading) {
    <div class="flex flex-col items-center justify-center py-32 gap-4">
      <svg class="w-8 h-8 animate-spin text-[#304040]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-sm text-gray-500">Generando informe de entrega...</p>
    </div>
    }

    <!-- ── Error ────────────────────────────────────────── -->
    @if (error) {
    <div class="max-w-2xl mx-auto mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>
    }

    <!-- ── Main content ─────────────────────────────────── -->
    @if (!loading && !error) {
    <div class="relative">

      <!-- ── Toolbar (print:hidden) ─────────────────────── -->
      <div class="print:hidden flex items-center justify-end gap-3 mb-6">
        <button (click)="onDownload('zip', api.downloadZipBlob(), 'etiquetador_hmm_entregables.zip')"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                [class.opacity-60]="dlState['zip']">
          @if (dlState['zip']) {
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
          }
          {{ dlState['zip'] ? 'Generando...' : 'Descargar ZIP' }}
        </button>
        <button (click)="print()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
                style="background-color: #04202C;">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-2.25 0h.008v.008H16.5V12z"/></svg>
          Imprimir
        </button>
      </div>

      <!-- ── Floating TOC (xl+, print:hidden) ───────────── -->
      <nav class="hidden xl:block fixed right-6 top-28 w-44 z-20 print:hidden">
        <div class="rounded-xl border border-gray-200 bg-white/90 backdrop-blur-md p-3 shadow-sm">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2 px-2">Secciones</p>
          <ul class="space-y-0.5">
            @for (s of sections; track s.id) {
            <li>
              <button (click)="scrollTo(s.id)"
                      class="w-full text-left px-2 py-1 rounded-md text-[11px] transition-all duration-150"
                      [class]="activeSection === s.id
                        ? 'bg-[#04202C]/8 text-[#04202C] font-semibold'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'">
                {{ s.label }}
              </button>
            </li>
            }
          </ul>
        </div>
      </nav>

      <!-- ── Sections ───────────────────────────────────── -->
      <div class="max-w-4xl mx-auto space-y-8">

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 1. PORTADA                                     -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="portada" class="print-break-after">
          <div class="rounded-2xl overflow-hidden portada-bg">
            <div class="px-6 py-14 sm:px-12 sm:py-24 text-center text-white space-y-4">
              <p class="text-xs sm:text-sm font-medium tracking-[0.15em] uppercase opacity-80">Universidad Internacional de La Rioja (UNIR)</p>
              <p class="text-xs sm:text-sm opacity-60">Maestria Universitaria en Inteligencia Artificial</p>
              <p class="text-xs opacity-50">Asignatura: Procesamiento del Lenguaje Natural</p>
              <div class="h-px w-20 mx-auto bg-white/25"></div>
              <h1 class="text-xl sm:text-3xl lg:text-4xl font-bold font-display leading-tight pt-2">
                Actividad 1: Etiquetado Morfosintactico
              </h1>
              <p class="text-sm sm:text-lg font-normal opacity-80">
                Implementacion de un etiquetador basado en Modelos Ocultos de Markov (HMM)<br class="hidden sm:inline"/>
                con Algoritmo de Viterbi
              </p>
              <div class="h-px w-20 mx-auto bg-white/25"></div>
              <div class="space-y-1 text-sm opacity-75 pt-1">
                <p class="font-semibold text-base">Equipo 1073F — Equipo PLN</p>
                @for (member of teamMembers; track member) {
                <p class="text-xs sm:text-sm">{{ member }}</p>
                }
              </div>
              <div class="h-px w-12 mx-auto bg-white/15"></div>
              <p class="text-xs opacity-60">Profesor: Prof. Wilmer Efren Pereira Gonzalez</p>
              <p class="text-xs opacity-50">Marzo 2026</p>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 2. INDICE                                      -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="indice" class="print-break-after">
          <div class="section-card rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6 font-display">Indice de Contenidos</h2>
            <ol class="space-y-2.5">
              @for (s of sections; track s.id) {
              <li class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-[#04202C]/8 text-[#04202C] text-[10px] font-bold flex items-center justify-center flex-shrink-0">{{ $index + 1 }}</span>
                <button (click)="scrollTo(s.id)"
                        class="text-sm sm:text-base text-[#304040] hover:text-[#04202C] hover:underline transition-colors">
                  {{ s.label }}
                </button>
              </li>
              }
            </ol>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 3. INTRODUCCION                                -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="introduccion" class="print-break-after">
          <div class="section-card rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <div class="flex items-center gap-3 mb-6">
              <span class="section-num">3</span>
              <h2 class="section-title">Introduccion y Objetivo</h2>
            </div>
            <div class="prose-forest space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                El etiquetado morfosintactico (<em>Part-of-Speech tagging</em>) es una tarea fundamental en el
                Procesamiento del Lenguaje Natural (PLN) que consiste en asignar a cada palabra de una oracion
                su categoria gramatical correspondiente: sustantivo, verbo, adjetivo, determinante, etc.
              </p>
              <p>
                En esta actividad se implementa un etiquetador basado en <strong>Modelos Ocultos de Markov (HMM)</strong>
                de tipo bigrama, utilizando el <strong>algoritmo de Viterbi</strong> para encontrar la secuencia de
                etiquetas mas probable dada una oracion de entrada. El sistema de etiquetas utilizado es
                <strong>EAGLES</strong> (Expert Advisory Group on Language Engineering Standards), estandar para el espanol,
                proporcionado por <strong>FreeLing</strong>.
              </p>
              <p>
                El corpus de entrenamiento es el <strong>Wikicorpus</strong> en espanol, un corpus anotado automaticamente
                a partir de Wikipedia que contiene millones de tokens etiquetados. La oracion principal de analisis es:
                <em class="text-gray-900 font-medium">"Habla con el enfermo grave de trasplantes."</em>
              </p>
              <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 mt-4">
                <p class="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  <strong>Nota importante:</strong> La implementacion se realizo <strong>sin utilizar bibliotecas NLP</strong>
                  como NLTK, spaCy o similares. Todo el procesamiento de probabilidades, algoritmo de Viterbi y evaluacion
                  se implemento desde cero en Python.
                </p>
              </div>
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 pt-2">Objetivos</h3>
              <ul class="list-disc list-inside space-y-1.5 ml-1">
                <li>Procesar el corpus Wikicorpus y calcular probabilidades de emision y transicion.</li>
                <li>Implementar el algoritmo de Viterbi para el etiquetado automatico de oraciones.</li>
                <li>Etiquetar las dos oraciones obligatorias y analizar las diferencias en los resultados.</li>
                <li>Evaluar el rendimiento del modelo con metricas de precision, recall y F1-score.</li>
                <li>Responder las 4 preguntas de analisis sobre el comportamiento del etiquetador.</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 4. METODOLOGIA                                 -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="metodologia" class="print-break-after">
          <div class="section-card rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <div class="flex items-center gap-3 mb-6">
              <span class="section-num">4</span>
              <h2 class="section-title">Metodologia</h2>
            </div>

            <!-- 3 methodology cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              @for (card of methodCards; track card.title) {
              <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-5 print-avoid-break">
                <div class="text-2xl mb-2">{{ card.icon }}</div>
                <h4 class="text-sm font-bold text-gray-900 mb-1.5">{{ card.title }}</h4>
                <p class="text-xs text-gray-600 leading-relaxed mb-3">{{ card.desc }}</p>
                <p class="text-[10px] font-semibold uppercase tracking-wider text-[#5B7065]">{{ card.stat }}</p>
              </div>
              }
            </div>

            <!-- Pipeline steps -->
            <div class="prose-forest text-sm sm:text-base text-gray-700 leading-relaxed">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3">Pipeline de Procesamiento</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for (step of pipelineSteps; track step.num) {
                <div class="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 print-avoid-break">
                  <span class="w-6 h-6 rounded-md bg-[#04202C] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{{ step.num }}</span>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ step.title }}</p>
                    <p class="text-xs text-gray-600 mt-0.5">{{ step.desc }}</p>
                  </div>
                </div>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 5. PARTE 1: PROBABILIDADES                     -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="probabilidades">
          <div class="section-card rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <div class="flex items-center gap-3 mb-6">
              <span class="section-num">5</span>
              <h2 class="section-title">Parte 1 — Tablas de Probabilidades</h2>
            </div>

            <!-- 5.1 Corpus stats -->
            @if (corpusStats) {
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3">5.1 Estadisticas del Corpus</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              @for (stat of corpusStatCards; track stat.label) {
              <div class="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 print-avoid-break">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{{ stat.label }}</p>
                <p class="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">{{ stat.value }}</p>
              </div>
              }
            </div>
            }

            <!-- 5.2 Emission probabilities -->
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">5.2 Probabilidades de Emision</h3>
            <p class="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">
              La tabla de emision <span class="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">P(w|t)</span>
              contiene la probabilidad de observar una palabra dado un estado (etiqueta). A continuacion se muestran
              las distribuciones de etiquetas para las palabras de las oraciones obligatorias.
            </p>

            @if (emissionsLoaded) {
            <div class="overflow-x-auto mb-4">
              <table class="min-w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th class="tbl-header rounded-tl-lg text-left">Palabra</th>
                    <th class="tbl-header text-right">Ocurrencias</th>
                    <th class="tbl-header text-left">Etiquetas observadas (top 5)</th>
                    <th class="tbl-header rounded-tr-lg text-center">Etiqueta Viterbi</th>
                  </tr>
                </thead>
                <tbody>
                  @for (word of sentenceWords; track word) {
                  <tr class="border-b border-gray-100">
                    <td class="px-3 py-2 font-semibold text-gray-800">{{ word }}</td>
                    <td class="px-3 py-2 text-right text-gray-600 font-mono">{{ getWordTotal(word) }}</td>
                    <td class="px-3 py-2">
                      <div class="flex flex-wrap gap-1">
                        @for (entry of getWordTopTags(word); track entry.tag) {
                        <span class="inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold border"
                              [style.background-color]="getTagBgColor(entry.tag)"
                              [style.border-color]="getTagColor(entry.tag) + '30'"
                              [style.color]="getTagColor(entry.tag)">
                          {{ entry.tag }} <span class="opacity-60">{{ entry.pct }}%</span>
                        </span>
                        }
                      </div>
                    </td>
                    <td class="px-3 py-2 text-center">
                      <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border"
                            [style.background-color]="getTagBgColor(getViterbiTag(word))"
                            [style.border-color]="getTagColor(getViterbiTag(word)) + '30'"
                            [style.color]="getTagColor(getViterbiTag(word))">
                        {{ getViterbiTag(word) }}
                      </span>
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
            } @else {
            <div class="flex items-center gap-2 py-4 text-gray-400 text-xs">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Cargando emisiones...
            </div>
            }

            <!-- 5.3 Transition probabilities -->
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2 mt-6">5.3 Probabilidades de Transicion</h3>
            <p class="text-xs sm:text-sm text-gray-600 mb-3 leading-relaxed">
              La tabla de transicion
              <span class="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">P(t<sub>i</sub>|t<sub>i-1</sub>)</span>
              contiene la probabilidad de pasar de una etiqueta a la siguiente. Las tablas completas
              estan disponibles como archivos Excel en la seccion de entregables.
            </p>

            <!-- Download buttons for emission/transition -->
            <div class="flex flex-wrap gap-2 mt-4 print:hidden">
              <button (click)="onDownload('emission', api.downloadEmissionExcelBlob(), 'tabla_emision.xlsx')"
                      class="dl-btn" [class.opacity-60]="dlState['emission']">
                @if (dlState['emission']) { <span class="dl-spinner"></span> }
                {{ dlState['emission'] ? 'Generando...' : 'Descargar Tabla Emision (Excel)' }}
              </button>
              <button (click)="onDownload('transition', api.downloadTransitionExcelBlob(), 'tabla_transicion.xlsx')"
                      class="dl-btn" [class.opacity-60]="dlState['transition']">
                @if (dlState['transition']) { <span class="dl-spinner"></span> }
                {{ dlState['transition'] ? 'Generando...' : 'Descargar Tabla Transicion (Excel)' }}
              </button>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 6. PARTE 2: VITERBI                            -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="viterbi">
          <div class="section-card rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <div class="flex items-center gap-3 mb-6">
              <span class="section-num">6</span>
              <h2 class="section-title">Parte 2 — Algoritmo de Viterbi y Etiquetado</h2>
            </div>
            <div class="prose-forest space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                Se ejecuta el algoritmo de Viterbi sobre las dos oraciones obligatorias. El algoritmo utiliza programacion
                dinamica para encontrar la secuencia de etiquetas mas probable:
                <span class="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">v<sub>t</sub>(j) = max[v<sub>t-1</sub>(i) &times; P(t<sub>j</sub>|t<sub>i</sub>)] &times; P(w<sub>t</sub>|t<sub>j</sub>)</span>
              </p>

              <!-- ── Sentence 1 ───────────────────────── -->
              @if (result1) {
              <div class="print-avoid-break">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3">6.1 Oracion 1</h3>
                <p class="text-xs sm:text-sm font-mono bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100 mb-3">
                  "{{ sentence1 }}"
                </p>

                <!-- Badge chips -->
                <div class="flex flex-wrap gap-1.5 mb-4">
                  @for (token of result1.tokens; track $index) {
                  <span class="tag-chip"
                        [style.background-color]="getTagBgColor(result1.tags[$index])"
                        [style.border-color]="getTagColor(result1.tags[$index]) + '30'">
                    <span class="font-semibold text-gray-900">{{ token }}</span>
                    <span class="tag-chip-tag" [style.color]="getTagColor(result1.tags[$index])">{{ result1.tags[$index] }}</span>
                  </span>
                  }
                </div>

                <!-- Result table -->
                <div class="overflow-x-auto mb-2">
                  <table class="min-w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th class="tbl-header rounded-tl-lg text-left">Token</th>
                        <th class="tbl-header text-center">Etiqueta</th>
                        <th class="tbl-header text-left rounded-tr-lg">Descripcion EAGLES</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (token of result1.tokens; track $index) {
                      <tr class="border-b border-gray-100">
                        <td class="px-3 py-2 font-semibold text-gray-800">{{ token }}</td>
                        <td class="px-3 py-2 text-center">
                          <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border"
                                [style.background-color]="getTagBgColor(result1.tags[$index])"
                                [style.border-color]="getTagColor(result1.tags[$index]) + '30'"
                                [style.color]="getTagColor(result1.tags[$index])">{{ result1.tags[$index] }}</span>
                        </td>
                        <td class="px-3 py-2 text-gray-600">{{ result1.descriptions[$index] }}</td>
                      </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <p class="text-[11px] text-gray-500 mb-3">
                  Probabilidad del camino optimo: <span class="font-mono font-semibold">{{ formatScientific(result1.best_path_prob) }}</span>
                </p>

                <!-- Expandable Viterbi Matrix -->
                <div class="print-avoid-break">
                  <button (click)="showMatrix1 = !showMatrix1"
                          class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#304040] hover:text-[#04202C] transition-colors print:hidden">
                    <svg class="w-3.5 h-3.5 transition-transform" [class.rotate-90]="showMatrix1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                    {{ showMatrix1 ? 'Ocultar' : 'Ver' }} Matriz de Viterbi
                  </button>
                  @if (showMatrix1) {
                  <div class="mt-3 overflow-x-auto rounded-xl border border-gray-200">
                    <table class="text-[10px] border-collapse min-w-full">
                      <thead>
                        <tr>
                          <th class="tbl-header sticky left-0 z-10 text-left min-w-[80px]">Etiqueta</th>
                          @for (token of result1.tokens; track $index) {
                          <th class="tbl-header text-center min-w-[70px]">{{ token }}</th>
                          }
                        </tr>
                      </thead>
                      <tbody>
                        @for (tag of getMatrixTags(result1); track tag) {
                        <tr class="border-b border-gray-50">
                          <td class="px-2 py-1 font-mono font-semibold text-gray-700 sticky left-0 z-10 bg-gray-50 border-r border-gray-100">{{ tag }}</td>
                          @for (token of result1.tokens; track $index) {
                          <td class="px-2 py-1 text-center font-mono"
                              [style.background-color]="getMatrixCellBg(getMatrixCellValue(result1, $index, tag), isOptimalTag(result1, $index, tag))"
                              [class.font-bold]="isOptimalTag(result1, $index, tag)"
                              [class.text-green-900]="isOptimalTag(result1, $index, tag)">
                            {{ formatMatrixCell(getMatrixCellValue(result1, $index, tag)) }}
                          </td>
                          }
                        </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                  <p class="text-[10px] text-gray-400 mt-1">Las celdas verdes indican la ruta optima seleccionada por el algoritmo.</p>
                  }
                </div>

                <!-- Download Viterbi Excel -->
                <div class="mt-3 print:hidden">
                  <button (click)="onDownload('viterbi1', api.downloadViterbiExcel(sentence1), 'viterbi_oracion_1.xlsx')"
                          class="dl-btn text-xs" [class.opacity-60]="dlState['viterbi1']">
                    {{ dlState['viterbi1'] ? 'Generando...' : 'Descargar Matriz Viterbi Oracion 1 (Excel)' }}
                  </button>
                </div>
              </div>
              }

              <!-- ── Sentence 2 ───────────────────────── -->
              @if (result2) {
              <div class="print-break-before print-avoid-break">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3">6.2 Oracion 2</h3>
                <p class="text-xs sm:text-sm font-mono bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100 mb-3">
                  "{{ sentence2 }}"
                </p>

                <!-- Badge chips -->
                <div class="flex flex-wrap gap-1.5 mb-4">
                  @for (token of result2.tokens; track $index) {
                  <span class="tag-chip"
                        [style.background-color]="getTagBgColor(result2.tags[$index])"
                        [style.border-color]="getTagColor(result2.tags[$index]) + '30'">
                    <span class="font-semibold text-gray-900">{{ token }}</span>
                    <span class="tag-chip-tag" [style.color]="getTagColor(result2.tags[$index])">{{ result2.tags[$index] }}</span>
                  </span>
                  }
                </div>

                <!-- Result table -->
                <div class="overflow-x-auto mb-2">
                  <table class="min-w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th class="tbl-header rounded-tl-lg text-left">Token</th>
                        <th class="tbl-header text-center">Etiqueta</th>
                        <th class="tbl-header text-left rounded-tr-lg">Descripcion EAGLES</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (token of result2.tokens; track $index) {
                      <tr class="border-b border-gray-100">
                        <td class="px-3 py-2 font-semibold text-gray-800">{{ token }}</td>
                        <td class="px-3 py-2 text-center">
                          <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border"
                                [style.background-color]="getTagBgColor(result2.tags[$index])"
                                [style.border-color]="getTagColor(result2.tags[$index]) + '30'"
                                [style.color]="getTagColor(result2.tags[$index])">{{ result2.tags[$index] }}</span>
                        </td>
                        <td class="px-3 py-2 text-gray-600">{{ result2.descriptions[$index] }}</td>
                      </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <p class="text-[11px] text-gray-500 mb-3">
                  Probabilidad del camino optimo: <span class="font-mono font-semibold">{{ formatScientific(result2.best_path_prob) }}</span>
                </p>

                <!-- Expandable Viterbi Matrix -->
                <div class="print-avoid-break">
                  <button (click)="showMatrix2 = !showMatrix2"
                          class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#304040] hover:text-[#04202C] transition-colors print:hidden">
                    <svg class="w-3.5 h-3.5 transition-transform" [class.rotate-90]="showMatrix2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
                    {{ showMatrix2 ? 'Ocultar' : 'Ver' }} Matriz de Viterbi
                  </button>
                  @if (showMatrix2) {
                  <div class="mt-3 overflow-x-auto rounded-xl border border-gray-200">
                    <table class="text-[10px] border-collapse min-w-full">
                      <thead>
                        <tr>
                          <th class="tbl-header sticky left-0 z-10 text-left min-w-[80px]">Etiqueta</th>
                          @for (token of result2.tokens; track $index) {
                          <th class="tbl-header text-center min-w-[70px]">{{ token }}</th>
                          }
                        </tr>
                      </thead>
                      <tbody>
                        @for (tag of getMatrixTags(result2); track tag) {
                        <tr class="border-b border-gray-50">
                          <td class="px-2 py-1 font-mono font-semibold text-gray-700 sticky left-0 z-10 bg-gray-50 border-r border-gray-100">{{ tag }}</td>
                          @for (token of result2.tokens; track $index) {
                          <td class="px-2 py-1 text-center font-mono"
                              [style.background-color]="getMatrixCellBg(getMatrixCellValue(result2, $index, tag), isOptimalTag(result2, $index, tag))"
                              [class.font-bold]="isOptimalTag(result2, $index, tag)"
                              [class.text-green-900]="isOptimalTag(result2, $index, tag)">
                            {{ formatMatrixCell(getMatrixCellValue(result2, $index, tag)) }}
                          </td>
                          }
                        </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                  <p class="text-[10px] text-gray-400 mt-1">Las celdas verdes indican la ruta optima seleccionada por el algoritmo.</p>
                  }
                </div>

                <div class="mt-3 print:hidden">
                  <button (click)="onDownload('viterbi2', api.downloadViterbiExcel(sentence2), 'viterbi_oracion_2.xlsx')"
                          class="dl-btn text-xs" [class.opacity-60]="dlState['viterbi2']">
                    {{ dlState['viterbi2'] ? 'Generando...' : 'Descargar Matriz Viterbi Oracion 2 (Excel)' }}
                  </button>
                </div>
              </div>
              }

              <!-- ── 6.3 Comparison ──────────────────── -->
              @if (comparisonRows.length > 0) {
              <div class="print-break-before print-avoid-break">
                <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">6.3 Comparacion de Ambos Etiquetados</h3>
                <p class="text-xs sm:text-sm text-gray-600 mb-3">
                  Palabras comunes entre ambas oraciones y sus etiquetas asignadas.
                  @if (diffCount > 0) {
                  <span class="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {{ diffCount }} diferencia{{ diffCount > 1 ? 's' : '' }}
                  </span>
                  } @else {
                  <span class="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                    Coinciden al 100%
                  </span>
                  }
                </p>
                <div class="overflow-x-auto mb-4">
                  <table class="min-w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th class="tbl-header rounded-tl-lg text-left">Palabra</th>
                        <th class="tbl-header text-center">Oracion 1</th>
                        <th class="tbl-header text-center">Oracion 2</th>
                        <th class="tbl-header rounded-tr-lg text-center">Coinciden</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of comparisonRows; track row.token) {
                      <tr class="border-b border-gray-100" [class.bg-amber-50]="row.isDifferent">
                        <td class="px-3 py-2 font-semibold text-gray-800">{{ row.token }}</td>
                        <td class="px-3 py-2 text-center">
                          @if (row.tag1 !== '-') {
                          <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border"
                                [style.background-color]="getTagBgColor(row.tag1)"
                                [style.border-color]="getTagColor(row.tag1) + '30'"
                                [style.color]="getTagColor(row.tag1)">{{ row.tag1 }}</span>
                          } @else { <span class="text-gray-400">—</span> }
                        </td>
                        <td class="px-3 py-2 text-center">
                          @if (row.tag2 !== '-') {
                          <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border"
                                [style.background-color]="getTagBgColor(row.tag2)"
                                [style.border-color]="getTagColor(row.tag2) + '30'"
                                [style.color]="getTagColor(row.tag2)">{{ row.tag2 }}</span>
                          } @else { <span class="text-gray-400">—</span> }
                        </td>
                        <td class="px-3 py-2 text-center">
                          @if (!row.isDifferent && row.tag1 !== '-' && row.tag2 !== '-') {
                          <svg class="w-4 h-4 text-green-600 mx-auto" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                          } @else if (row.isDifferent) {
                          <svg class="w-4 h-4 text-amber-500 mx-auto" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                          } @else {
                          <span class="text-gray-400">—</span>
                          }
                        </td>
                      </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Interpretation -->
                <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <h4 class="text-sm font-semibold text-gray-900 mb-1.5">Interpretacion</h4>
                  <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    @if (diffCount === 0) {
                    El modelo HMM bigrama asigna las mismas etiquetas a ambas oraciones a pesar del diferente orden
                    de palabras. Esto se debe a que las probabilidades de emision (la probabilidad de la palabra dado
                    la etiqueta) dominan sobre las probabilidades de transicion en la decision final del Viterbi. Las
                    palabras "habla", "enfermo" y "grave" mantienen su categoria gramatical independientemente de su
                    posicion, ya que su distribucion de etiquetas en el corpus es lo suficientemente concentrada
                    en una categoria principal.
                    } @else {
                    Se observan {{ diffCount }} diferencia(s) en las etiquetas asignadas. El cambio de orden sintactico
                    afecta las probabilidades de transicion P(t<sub>i</sub>|t<sub>i-1</sub>), lo que puede llevar al algoritmo
                    de Viterbi a seleccionar una etiqueta diferente cuando el contexto precedente cambia. Esto demuestra
                    la sensibilidad del modelo HMM bigrama al orden de las palabras.
                    }
                  </p>
                </div>
              </div>
              }
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 7. PARTE 3: ANALISIS                           -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="analisis" class="print-break-before">
          <div class="section-card rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <div class="flex items-center gap-3 mb-6">
              <span class="section-num">7</span>
              <h2 class="section-title">Parte 3 — Analisis del Etiquetador</h2>
            </div>
            <div class="space-y-5">
              @for (q of analysisQuestions; track q.id) {
              <div class="rounded-xl p-4 sm:p-5 print-avoid-break"
                   [class]="'border-l-4 ' + getQuestionBorderClass($index)">
                <h4 class="text-sm sm:text-base font-semibold text-gray-900 mb-2.5">
                  <span class="font-bold" [style.color]="getQuestionColor($index)">Pregunta {{ $index + 1 }}.</span>
                  {{ q.question }}
                </h4>
                <div class="text-xs sm:text-sm text-gray-700 leading-relaxed qa-answer" [innerHTML]="q.answer_html"></div>
              </div>
              }

              @if (analysisQuestions.length === 0) {
              <p class="text-sm text-gray-500 text-center py-6">No se encontraron preguntas de analisis.</p>
              }
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 8. ENTREGABLES                                 -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="entregables" class="print-break-before">
          <div class="section-card rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <div class="flex items-center gap-3 mb-6">
              <span class="section-num">8</span>
              <h2 class="section-title">Entregables</h2>
            </div>

            <!-- File table -->
            <div class="overflow-x-auto mb-6">
              <table class="min-w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th class="tbl-header rounded-tl-lg text-center w-8">#</th>
                    <th class="tbl-header text-left">Archivo</th>
                    <th class="tbl-header text-left">Descripcion</th>
                    <th class="tbl-header rounded-tr-lg text-center print:hidden">Descargar</th>
                  </tr>
                </thead>
                <tbody>
                  @for (e of deliverables; track e.key) {
                  <tr class="border-b border-gray-100 print-avoid-break">
                    <td class="px-3 py-2.5 text-center font-bold text-gray-400">{{ $index + 1 }}</td>
                    <td class="px-3 py-2.5 font-semibold text-gray-900 text-xs sm:text-sm">{{ e.name }}</td>
                    <td class="px-3 py-2.5 text-gray-600 text-xs sm:text-sm">{{ e.desc }}</td>
                    <td class="px-3 py-2.5 text-center print:hidden">
                      <button (click)="e.action()"
                              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white transition-colors hover:opacity-90"
                              style="background-color: #04202C;"
                              [class.opacity-60]="dlState[e.key]">
                        {{ dlState[e.key] ? '...' : 'Descargar' }}
                      </button>
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Big ZIP button -->
            <div class="print:hidden">
              <button (click)="onDownload('zip', api.downloadZipBlob(), 'etiquetador_hmm_entregables.zip')"
                      class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                      style="background-color: #04202C;"
                      [class.opacity-60]="dlState['zip']">
                @if (dlState['zip']) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
                }
                {{ dlState['zip'] ? 'Generando ZIP...' : 'Descargar Todo (ZIP)' }}
              </button>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 9. CONCLUSIONES                                -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="conclusiones" class="print-break-before">
          <div class="section-card rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <div class="flex items-center gap-3 mb-6">
              <span class="section-num">9</span>
              <h2 class="section-title">Conclusiones</h2>
            </div>
            <div class="prose-forest space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              <p>
                Se implemento exitosamente un etiquetador morfosintactico basado en el modelo HMM bigrama con el
                algoritmo de Viterbi para el idioma espanol. El sistema procesa el Wikicorpus, calcula las matrices
                de probabilidades de emision y transicion, y etiqueta oraciones de forma automatica.
              </p>
              <p>
                El etiquetado de ambas oraciones obligatorias produce resultados coherentes y linguisticamente correctos.
                La comparacion entre ambas demuestra como el modelo maneja las mismas palabras en diferentes contextos
                sintacticos.
              </p>
              <ol class="list-decimal list-inside space-y-3 ml-1">
                <li>
                  <strong>Efectividad del modelo HMM:</strong> El modelo probabilistico basado en bigramas captura
                  adecuadamente las regularidades estadisticas del idioma espanol, logrando asignar etiquetas
                  coherentes en la mayoria de los casos.
                </li>
                <li>
                  <strong>Importancia del contexto:</strong> La comparacion entre las dos oraciones demuestra como el
                  contexto sintactico influye en la asignacion de etiquetas. El modelo bigrama resuelve las ambiguedades
                  principales utilizando la etiqueta inmediatamente anterior.
                </li>
                <li>
                  <strong>Limitaciones conocidas:</strong> El modelo presenta limitaciones inherentes al enfoque bigrama:
                  contexto limitado a una etiqueta anterior, sensibilidad a palabras fuera de vocabulario (OOV) y sesgo
                  del corpus de entrenamiento.
                </li>
                <li>
                  <strong>Mejoras propuestas:</strong> Se identificaron mejoras concretas como trigramas, suavizado
                  avanzado, analisis morfologico para OOV, y enfoques neuronales (BiLSTM-CRF, Transformers).
                </li>
                <li>
                  <strong>Implementacion desde cero:</strong> Todo el sistema fue implementado sin utilizar bibliotecas
                  NLP externas, demostrando comprension profunda de los fundamentos del PLN estadistico.
                </li>
              </ol>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════ -->
        <!-- 10. CHECKLIST                                  -->
        <!-- ═══════════════════════════════════════════════ -->
        <section id="checklist" class="print-break-before">
          <div class="section-card rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            <div class="flex items-center gap-3 mb-6">
              <span class="section-num">10</span>
              <h2 class="section-title">Lista de Verificacion</h2>
            </div>
            <p class="text-xs sm:text-sm text-gray-600 mb-4">
              Requisitos de la actividad que deben estar incluidos en la entrega.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (item of checklist; track item.id) {
              <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-green-50 print-avoid-break">
                <svg class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
                <span class="text-xs sm:text-sm text-green-800 font-medium leading-relaxed">{{ item.label }}</span>
              </div>
              }
            </div>
            @if (checklist.length === 0) {
            <p class="text-sm text-gray-500 text-center py-6">No se encontraron items del checklist.</p>
            }
          </div>
        </section>

        <!-- ── Footer ───────────────────────────────────── -->
        <footer class="text-center py-8 border-t border-gray-100 mt-8">
          <p class="text-xs text-gray-500">
            Informe generado automaticamente — Equipo 1073F — UNIR 2026
          </p>
        </footer>

      </div><!-- max-w-4xl -->
    </div>
    }
  `,
  styles: [`
    :host { display: block; }

    /* ── Portada ─────────────────────────────────── */
    .portada-bg {
      background: linear-gradient(135deg, #04202C 0%, #1A3036 40%, #304040 70%, #5B7065 100%);
    }

    /* ── Section cards ───────────────────────────── */
    .section-card {
      box-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 4px 12px -2px rgba(0,0,0,0.04);
    }
    .section-num {
      display: flex; align-items: center; justify-content: center;
      width: 2rem; height: 2rem; border-radius: 0.5rem;
      background: #04202C; color: white;
      font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
    }
    .section-title {
      font-size: 1.25rem; font-weight: 700; color: #04202C;
      font-family: 'Sora', sans-serif;
    }
    @media (min-width: 640px) { .section-title { font-size: 1.5rem; } }

    /* ── Table headers ───────────────────────────── */
    .tbl-header {
      background: #04202C; color: white;
      padding: 0.5rem 0.75rem; font-weight: 600; font-size: 0.75rem;
      white-space: nowrap;
    }

    /* ── Tag badge chips ─────────────────────────── */
    .tag-chip {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.25rem 0.5rem; border-radius: 9999px;
      border: 1px solid; font-size: 0.75rem;
    }
    .tag-chip-tag {
      font-size: 0.625rem; font-weight: 700; font-family: 'JetBrains Mono', monospace;
    }

    /* ── Download buttons ────────────────────────── */
    .dl-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.375rem 0.75rem; border-radius: 0.5rem;
      font-size: 0.75rem; font-weight: 600;
      border: 1px solid rgba(4,32,44,0.15);
      color: #304040; background: white;
      transition: all 0.15s;
    }
    .dl-btn:hover { background: #f7f8f7; border-color: rgba(4,32,44,0.3); }

    /* ── Prose ────────────────────────────────────── */
    .prose-forest p { line-height: 1.7; }
    .prose-forest strong { color: #04202C; }

    /* ── Q&A answer HTML ─────────────────────────── */
    .qa-answer :deep(p) { margin-bottom: 0.5rem; line-height: 1.7; }
    .qa-answer :deep(ul) { list-style: disc inside; margin: 0.5rem 0; }
    .qa-answer :deep(ol) { list-style: decimal inside; margin: 0.5rem 0; }
    .qa-answer :deep(li) { margin-bottom: 0.25rem; }
    .qa-answer :deep(strong) { color: #04202C; }
    .qa-answer :deep(code) {
      font-family: 'JetBrains Mono', monospace; font-size: 0.8em;
      background: rgba(4,32,44,0.06); padding: 0.15em 0.4em; border-radius: 4px;
    }

    /* ── Analysis question borders ───────────────── */
    .q-border-green  { border-left-color: #38A169; background: #f0fff4; }
    .q-border-blue   { border-left-color: #3182CE; background: #ebf8ff; }
    .q-border-orange { border-left-color: #DD6B20; background: #fffaf0; }
    .q-border-purple { border-left-color: #805AD5; background: #faf5ff; }
  `],
})
export class InformeComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly api = inject(ApiService);

  // ── State ──────────────────────────────────────
  loading = true;
  error = '';
  dlState: Record<string, boolean> = {};
  activeSection = 'portada';
  showMatrix1 = false;
  showMatrix2 = false;
  emissionsLoaded = false;

  // ── Data ───────────────────────────────────────
  corpusStats: CorpusStats | null = null;
  result1: ViterbiResult | null = null;
  result2: ViterbiResult | null = null;
  tagColors: Record<string, string> = {};
  analysisQuestions: AnalysisQuestion[] = [];
  checklist: ExportChecklistItem[] = [];
  wordEmissions = new Map<string, CorpusSearchResult>();

  // ── Constants ──────────────────────────────────
  sentence1 = 'Habla con el enfermo grave de trasplantes .';
  sentence2 = 'El enfermo grave habla de trasplantes .';

  teamMembers = [
    'Adonai Samael Hernandez Mata',
    'Diego Alfonso Najera Ortiz',
    'Mauricio Alberto Alvares Aspeitia',
    'Cesar Ivan Martinez Perez',
  ];

  sections = [
    { id: 'portada', label: '1. Portada' },
    { id: 'indice', label: '2. Indice' },
    { id: 'introduccion', label: '3. Introduccion' },
    { id: 'metodologia', label: '4. Metodologia' },
    { id: 'probabilidades', label: '5. Probabilidades' },
    { id: 'viterbi', label: '6. Viterbi' },
    { id: 'analisis', label: '7. Analisis' },
    { id: 'entregables', label: '8. Entregables' },
    { id: 'conclusiones', label: '9. Conclusiones' },
    { id: 'checklist', label: '10. Checklist' },
  ];

  methodCards = [
    { icon: '\uD83D\uDCDA', title: 'Carga del Corpus', desc: 'Se procesaron los archivos del Wikicorpus en espanol, extrayendo token (columna 1) y etiqueta POS EAGLES (columna 3).', stat: '' },
    { icon: '\uD83D\uDCCA', title: 'Calculo de Probabilidades', desc: 'P(w|t) = C(t,w)/C(t) para emision. P(t_i|t_{i-1}) = C(t_{i-1},t_i)/C(t_{i-1}) para transicion.', stat: '' },
    { icon: '\uD83D\uDD0D', title: 'Algoritmo de Viterbi', desc: 'Programacion dinamica: v_t(j) = max[v_{t-1}(i) * P(t_j|t_i)] * P(w_t|t_j). Backtrace para ruta optima.', stat: '' },
  ];

  pipelineSteps = [
    { num: 1, title: 'Procesamiento del Corpus', desc: 'Lectura y limpieza del Wikicorpus, extrayendo pares (palabra, etiqueta) de cada oracion.' },
    { num: 2, title: 'Calculo de Probabilidades', desc: 'Estimacion de probabilidades de emision y transicion con suavizado de Laplace.' },
    { num: 3, title: 'Algoritmo de Viterbi', desc: 'Programacion dinamica para encontrar la secuencia de etiquetas mas probable.' },
    { num: 4, title: 'Evaluacion', desc: 'Medicion del rendimiento con accuracy, precision, recall y F1-score sobre conjunto de prueba.' },
  ];

  /** Unique words from both sentences (excluding ".") for the emissions table */
  sentenceWords: string[] = [];

  /** Deliverables with download actions */
  deliverables: { key: string; name: string; desc: string; action: () => void }[] = [];

  private questionBorders = ['q-border-green', 'q-border-blue', 'q-border-orange', 'q-border-purple'];
  private questionColors = ['#38A169', '#3182CE', '#DD6B20', '#805AD5'];
  private observer: IntersectionObserver | null = null;

  // ── Lifecycle ──────────────────────────────────

  ngOnInit(): void {
    forkJoin({
      stats: this.api.getCorpusStats(),
      r1: this.api.tagSentence(this.sentence1),
      r2: this.api.tagSentence(this.sentence2),
      colors: this.api.getTagColors(),
      questions: this.api.getAnalysisQuestions(),
      checklist: this.api.getExportChecklist(),
    }).subscribe({
      next: (data) => {
        this.corpusStats = data.stats;
        this.result1 = data.r1;
        this.result2 = data.r2;
        this.tagColors = data.colors;
        this.analysisQuestions = data.questions.questions;
        this.checklist = data.checklist.items;
        this.loading = false;

        // Update dynamic stats on method cards
        this.methodCards[0].stat = `${this.formatNumber(data.stats.total_tokens)} tokens | ${this.formatNumber(data.stats.unique_tags)} etiquetas`;
        this.methodCards[1].stat = `${this.formatNumber(data.stats.unique_words)} palabras unicas`;
        this.methodCards[2].stat = 'Backtrace para ruta optima';

        // Build deliverables list
        this.buildDeliverables();

        // Compute unique sentence words and load emissions
        this.sentenceWords = [...new Set([
          ...data.r1.tokens.map((t: string) => t.toLowerCase()),
          ...data.r2.tokens.map((t: string) => t.toLowerCase()),
        ])].filter(w => w !== '.');
        this.loadWordEmissions();
      },
      error: (err) => {
        this.error = err?.error?.detail ?? err?.message ?? 'Error al cargar datos del informe.';
        this.loading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.setupScrollSpy(), 600);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  // ── Data loading ───────────────────────────────

  private loadWordEmissions(): void {
    const calls: Record<string, Observable<CorpusSearchResult>> = {};
    for (const w of this.sentenceWords) {
      calls[w] = this.api.searchWord(w, 10);
    }
    if (Object.keys(calls).length === 0) {
      this.emissionsLoaded = true;
      return;
    }
    forkJoin(calls).subscribe({
      next: (results) => {
        for (const [word, result] of Object.entries(results)) {
          this.wordEmissions.set(word, result);
        }
        this.emissionsLoaded = true;
      },
      error: () => { this.emissionsLoaded = true; },
    });
  }

  private buildDeliverables(): void {
    this.deliverables = [
      { key: 'notebook', name: 'etiquetador_hmm_viterbi.ipynb', desc: 'Notebook principal con codigo, resultados y respuestas', action: () => this.onDownload('notebook', this.api.downloadNotebookBlob(), 'etiquetador_hmm_viterbi.ipynb') },
      { key: 'emission', name: 'tabla_emision.xlsx', desc: 'Probabilidades de emision P(w|t)', action: () => this.onDownload('emission', this.api.downloadEmissionExcelBlob(), 'tabla_emision.xlsx') },
      { key: 'transition', name: 'tabla_transicion.xlsx', desc: 'Probabilidades de transicion P(t_i|t_{i-1})', action: () => this.onDownload('transition', this.api.downloadTransitionExcelBlob(), 'tabla_transicion.xlsx') },
      { key: 'viterbi1', name: 'viterbi_oracion_1.xlsx', desc: 'Matriz de Viterbi para oracion 1', action: () => this.onDownload('viterbi1', this.api.downloadViterbiExcel(this.sentence1), 'viterbi_oracion_1.xlsx') },
      { key: 'viterbi2', name: 'viterbi_oracion_2.xlsx', desc: 'Matriz de Viterbi para oracion 2', action: () => this.onDownload('viterbi2', this.api.downloadViterbiExcel(this.sentence2), 'viterbi_oracion_2.xlsx') },
    ];
  }

  // ── Scroll spy ─────────────────────────────────

  private setupScrollSpy(): void {
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) this.activeSection = entry.target.id;
      }
    }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    for (const section of this.sections) {
      const el = document.getElementById(section.id);
      if (el) this.observer.observe(el);
    }
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  print(): void { window.print(); }

  // ── Tag colors ─────────────────────────────────

  getTagColor(tag: string): string {
    if (!tag || tag.length === 0) return '#9ca3af';
    const family = tag.charAt(0).toUpperCase();
    return this.tagColors[family] ?? '#5B7065';
  }

  getTagBgColor(tag: string): string {
    const hex = this.getTagColor(tag);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  }

  // ── Word emissions ─────────────────────────────

  getWordTotal(word: string): string {
    const e = this.wordEmissions.get(word.toLowerCase());
    return e ? this.formatNumber(e.total_occurrences) : '—';
  }

  getWordTopTags(word: string): { tag: string; pct: number }[] {
    const e = this.wordEmissions.get(word.toLowerCase());
    if (!e || !e.tags) return [];
    const total = e.total_occurrences || 1;
    return Object.entries(e.tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, pct: Math.round((count / total) * 100) }));
  }

  getViterbiTag(word: string): string {
    const lw = word.toLowerCase();
    if (this.result1) {
      const idx = this.result1.tokens.findIndex(t => t.toLowerCase() === lw);
      if (idx >= 0) return this.result1.tags[idx];
    }
    if (this.result2) {
      const idx = this.result2.tokens.findIndex(t => t.toLowerCase() === lw);
      if (idx >= 0) return this.result2.tags[idx];
    }
    return '—';
  }

  // ── Viterbi matrix ─────────────────────────────

  getMatrixTags(result: ViterbiResult): string[] {
    const tagSet = new Set<string>();
    for (const step of result.viterbi_matrix) {
      for (const [tag, val] of Object.entries(step)) {
        if (val !== null && val !== undefined && val !== 0) tagSet.add(tag);
      }
    }
    // Sort: optimal path tags first, then alphabetical
    const optimal = new Set(result.tags);
    return [...tagSet].sort((a, b) => {
      const aOpt = optimal.has(a) ? 0 : 1;
      const bOpt = optimal.has(b) ? 0 : 1;
      if (aOpt !== bOpt) return aOpt - bOpt;
      return a.localeCompare(b);
    });
  }

  getMatrixCellValue(result: ViterbiResult, tokenIdx: number, tag: string): number | null {
    const step = result.viterbi_matrix[tokenIdx];
    if (!step) return null;
    const val = step[tag];
    return (val !== null && val !== undefined && val !== 0) ? val : null;
  }

  isOptimalTag(result: ViterbiResult, tokenIdx: number, tag: string): boolean {
    return result.tags[tokenIdx] === tag;
  }

  getMatrixCellBg(value: number | null, isOptimal: boolean): string {
    if (isOptimal) return 'rgba(34, 197, 94, 0.15)';
    if (value === null) return 'transparent';
    return 'rgba(4, 32, 44, 0.03)';
  }

  formatMatrixCell(value: number | null): string {
    if (value === null) return '';
    if (value === 0) return '0';
    return value.toExponential(1);
  }

  // ── Comparison ─────────────────────────────────

  get comparisonRows(): { token: string; tag1: string; tag2: string; isDifferent: boolean }[] {
    if (!this.result1 || !this.result2) return [];
    const map1 = new Map<string, string>();
    const map2 = new Map<string, string>();
    for (let i = 0; i < this.result1.tokens.length; i++) {
      const key = this.result1.tokens[i].toLowerCase();
      if (!map1.has(key)) map1.set(key, this.result1.tags[i]);
    }
    for (let i = 0; i < this.result2.tokens.length; i++) {
      const key = this.result2.tokens[i].toLowerCase();
      if (!map2.has(key)) map2.set(key, this.result2.tags[i]);
    }
    const allKeys = new Set([...map1.keys(), ...map2.keys()]);
    const rows: { token: string; tag1: string; tag2: string; isDifferent: boolean }[] = [];
    for (const key of allKeys) {
      const t1 = map1.get(key) ?? '-';
      const t2 = map2.get(key) ?? '-';
      rows.push({ token: key, tag1: t1, tag2: t2, isDifferent: t1 !== t2 });
    }
    return rows;
  }

  get diffCount(): number {
    return this.comparisonRows.filter(r => r.isDifferent).length;
  }

  // ── Corpus stat cards ──────────────────────────

  get corpusStatCards(): { label: string; value: string }[] {
    if (!this.corpusStats) return [];
    return [
      { label: 'Tokens totales', value: this.formatNumber(this.corpusStats.total_tokens) },
      { label: 'Oraciones', value: this.formatNumber(this.corpusStats.total_sentences) },
      { label: 'Etiquetas unicas', value: this.formatNumber(this.corpusStats.unique_tags) },
      { label: 'Palabras unicas', value: this.formatNumber(this.corpusStats.unique_words) },
      { label: 'Documentos', value: this.formatNumber(this.corpusStats.total_documents) },
      { label: 'Archivos procesados', value: this.formatNumber(this.corpusStats.processed_files) },
    ];
  }

  // ── Question styling ───────────────────────────

  getQuestionBorderClass(index: number): string {
    return this.questionBorders[index % this.questionBorders.length];
  }

  getQuestionColor(index: number): string {
    return this.questionColors[index % this.questionColors.length];
  }

  // ── Downloads ──────────────────────────────────

  onDownload(key: string, obs: Observable<Blob>, filename: string): void {
    if (this.dlState[key]) return;
    this.dlState[key] = true;
    obs.subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        this.dlState[key] = false;
      },
      error: () => { this.dlState[key] = false; },
    });
  }

  // ── Formatting ─────────────────────────────────

  formatNumber(n: number): string {
    return n?.toLocaleString('es-MX') ?? '—';
  }

  formatScientific(value: number | null | undefined): string {
    if (value === null || value === undefined) return '--';
    if (value === 0) return '0.00e+0';
    return value.toExponential(2);
  }
}
