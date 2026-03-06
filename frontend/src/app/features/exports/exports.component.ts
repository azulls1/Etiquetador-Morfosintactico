import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { QuickSentence, ExportChecklistItem } from '../../core/models/viterbi.model';
import { ToastComponent } from '../../shared/components/toast/toast.component';

interface ChecklistItem {
  id: number;
  label: string;
  sort_order: number;
  checked: boolean;
}

const CHECKLIST_STORAGE_KEY = 'etqmorf_export_checklist_state';

@Component({
  selector: 'app-exports',
  standalone: true,
  imports: [FormsModule, ToastComponent],
  template: `
    <div class="space-y-6 sm:space-y-10">
      <div class="max-w-6xl mx-auto space-y-6 sm:space-y-10">

        <!-- ── Encabezado ─────────────────────────────────────── -->
        <header class="text-center space-y-3 px-2">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
               style="background-color: rgba(4,32,44,0.1); color: #04202C;">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Centro de Descargas
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Entregables de la Actividad</h1>
          <p class="text-gray-700 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">
            Descarga todos los archivos necesarios para la entrega de la
            <span class="font-semibold text-gray-700">Actividad 1: Etiquetado Morfosintactico</span>
          </p>
        </header>

        <!-- ── Tarjeta destacada: ZIP ─────────────────────────── -->
        <section>
          <div (click)="onDownloadZip()"
             class="group relative block rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
             style="border-color: #04202C; background: linear-gradient(135deg, #04202C 0%, #1A3036 100%);">
            <div class="flex flex-col items-center gap-4 p-5 sm:p-8 md:flex-row md:gap-6">
              <div class="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center
                          group-hover:scale-110 transition-transform duration-300">
                <svg class="w-7 h-7 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div class="flex-1 text-center md:text-left min-w-0">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 justify-center md:justify-start">
                  <h2 class="text-lg sm:text-xl font-bold text-white">ZIP - Todos los Entregables</h2>
                  <span class="self-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-[#5B7065] text-white">
                    Recomendado
                  </span>
                </div>
                <p class="mt-1 text-blue-100 text-sm leading-relaxed">
                  Archivo ZIP con todos los entregables: Notebook, tablas de emision y transicion.
                </p>
              </div>
              <div class="flex-shrink-0">
                <span class="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm transition-all
                             bg-white group-hover:bg-gray-50"
                      [class.opacity-70]="downloading['zip']"
                      style="color: #04202C;">
                  @if (!downloading['zip']) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  } @else {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  }
                  {{ downloading['zip'] ? 'Generando...' : 'Descargar ZIP' }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- ── Tarjetas de descarga individuales ──────────────── -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

          <!-- Jupyter Notebook -->
          <div (click)="onDownloadNotebook()"
             class="group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-6
                    hover:shadow-lg hover:border-[#5B7065]/40 transition-all duration-300 cursor-pointer">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center
                          group-hover:scale-110 transition-transform duration-300"
                   style="background-color: rgba(4,32,44,0.08);">
                <svg class="w-5 h-5 sm:w-7 sm:h-7" style="color: #04202C;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-sm sm:text-base font-bold text-gray-900">Jupyter Notebook (.ipynb)</h3>
                  <span class="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase"
                        style="background-color: rgba(4,32,44,0.1); color: #04202C;">
                    Principal
                  </span>
                </div>
                <p class="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Notebook completo con codigo Python, resultados y respuestas a las preguntas.
                </p>
              </div>
            </div>
            <div class="mt-auto pt-4 sm:pt-5">
              <span class="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg text-sm font-semibold text-white
                           group-hover:opacity-90 transition-opacity w-full justify-center"
                    [class.opacity-70]="downloading['notebook']"
                    style="background-color: #04202C;">
                @if (!downloading['notebook']) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                } @else {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                }
                {{ downloading['notebook'] ? 'Generando...' : 'Descargar Notebook' }}
              </span>
            </div>
          </div>

          <!-- Excel Emision -->
          <div (click)="onDownloadEmission()"
             class="group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-6
                    hover:shadow-lg hover:border-[#5B7065]/40 transition-all duration-300 cursor-pointer">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-[#04202C]/8
                          group-hover:scale-110 transition-transform duration-300">
                <svg class="w-5 h-5 sm:w-7 sm:h-7 text-[#04202C]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12c-.621 0-1.125.504-1.125 1.125M12 12c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125M12 15.75c-.621 0-1.125-.504-1.125-1.125m0 0v-1.5c0-.621.504-1.125 1.125-1.125" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm sm:text-base font-bold text-gray-900">Excel - Tabla de Emision (.xlsx)</h3>
                <p class="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Probabilidades de emision P(palabra|etiqueta) calculadas del Wikicorpus.
                </p>
              </div>
            </div>
            <div class="mt-auto pt-4 sm:pt-5">
              <span class="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg text-sm font-semibold text-white
                           bg-[#04202C] group-hover:bg-[#1A3036] transition-colors w-full justify-center"
                    [class.opacity-70]="downloading['emission']">
                @if (!downloading['emission']) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                } @else {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                }
                {{ downloading['emission'] ? 'Generando...' : 'Descargar Excel' }}
              </span>
            </div>
          </div>

          <!-- Excel Transicion -->
          <div (click)="onDownloadTransition()"
             class="group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-6
                    hover:shadow-lg hover:border-[#5B7065]/40 transition-all duration-300 cursor-pointer">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-[#04202C]/8
                          group-hover:scale-110 transition-transform duration-300">
                <svg class="w-5 h-5 sm:w-7 sm:h-7 text-[#04202C]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm sm:text-base font-bold text-gray-900">Excel - Tabla de Transicion (.xlsx)</h3>
                <p class="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
                  Probabilidades de transicion P(etiqueta_i|etiqueta_{{'{'}}{{'i-1'}}{{'}'}}
                  ) y matriz de transicion.
                </p>
              </div>
            </div>
            <div class="mt-auto pt-4 sm:pt-5">
              <span class="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg text-sm font-semibold text-white
                           bg-[#04202C] group-hover:bg-[#1A3036] transition-colors w-full justify-center"
                    [class.opacity-70]="downloading['transition']">
                @if (!downloading['transition']) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                } @else {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                }
                {{ downloading['transition'] ? 'Generando...' : 'Descargar Excel' }}
              </span>
            </div>
          </div>

          <!-- Viterbi Excel cards — one per sentence -->
          @for (s of quickSentences; track s.id) {
          <div class="group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-6
                      hover:shadow-lg hover:border-[#5B7065]/40 transition-all duration-300 cursor-pointer"
               (click)="onDownloadViterbi(s)">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-[#5B7065]/10
                          group-hover:scale-110 transition-transform duration-300">
                <svg class="w-5 h-5 sm:w-7 sm:h-7 text-[#5B7065]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm sm:text-base font-bold text-gray-900">Excel - Matriz de Viterbi (.xlsx)</h3>
                <p class="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
                  Matriz de Viterbi para:
                  <em class="text-gray-800">"{{ s.sentence }}"</em>
                </p>
              </div>
            </div>
            <div class="mt-auto pt-4 sm:pt-5">
              <span class="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg text-sm font-semibold text-white
                           bg-[#04202C] group-hover:bg-[#1A3036] transition-colors w-full justify-center"
                    [class.opacity-70]="downloading['viterbi_' + s.id]">
                @if (!downloading['viterbi_' + s.id]) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                } @else {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                }
                {{ downloading['viterbi_' + s.id] ? 'Generando...' : 'Descargar Excel' }}
              </span>
            </div>
          </div>
          }

        </section>

        <!-- ── Lista de verificacion ──────────────────────────── -->
        <section class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-8">
          <div class="flex items-center gap-3 mb-5 sm:mb-6">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                 style="background-color: rgba(4,32,44,0.08);">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" style="color: #04202C;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h2 class="text-base sm:text-lg font-bold text-gray-900">Lista de Verificacion</h2>
              <p class="text-xs sm:text-sm text-gray-700">Requisitos de la actividad que deben estar incluidos en la entrega</p>
            </div>
          </div>

          <!-- Acciones rapidas del checklist -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <button (click)="onGenerateAllAndVerify()"
                    [disabled]="downloading['zip']"
                    class="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all
                           hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    style="background-color: #04202C;">
              @if (downloading['zip']) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando...
              } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Generar Todo y Verificar
              }
            </button>
            <button (click)="onToggleAll(true)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
                           border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Marcar todo
            </button>
            <button (click)="onToggleAll(false)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
                           border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Desmarcar todo
            </button>
          </div>

          @if (checklistLoading) {
          <div class="flex items-center justify-center py-8 text-gray-500 text-sm gap-2">
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            Cargando checklist...
          </div>
          } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            @for (item of checklist; track item.id; let i = $index) {
            <label [class]="'flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer transition-colors ' + (item.checked ? 'bg-green-50' : 'hover:bg-gray-50')">
              <div class="flex-shrink-0 mt-0.5">
                <input type="checkbox"
                       [(ngModel)]="item.checked"
                       (ngModelChange)="onCheckChange()"
                       class="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 transition-colors cursor-pointer"
                       style="accent-color: #04202C;" />
              </div>
              <span [class]="'text-xs sm:text-sm leading-relaxed ' + (item.checked ? 'text-green-800 font-medium' : 'text-gray-700')">
                {{ item.label }}
              </span>
            </label>
            }
          </div>

          <!-- Barra de progreso -->
          <div class="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs sm:text-sm font-medium text-gray-800">Progreso de verificacion</span>
              <span class="text-xs sm:text-sm font-bold" style="color: #04202C;">
                {{ checkedCount }} / {{ checklist.length }}
              </span>
            </div>
            <div class="w-full h-2 sm:h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500 ease-out"
                   [style.width.%]="progressPercent"
                   [style.background-color]="progressPercent === 100 ? '#16a34a' : '#04202C'">
              </div>
            </div>
            @if (progressPercent === 100) {
            <p class="mt-2 text-xs sm:text-sm font-semibold text-green-600 flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Todos los requisitos han sido verificados
            </p>
            }
          </div>
          }
        </section>

      </div>
    </div>

    <app-toast />
  `
})
export class ExportsComponent implements OnInit {
  private api = inject(ApiService);
  @ViewChild(ToastComponent) toast!: ToastComponent;

  /** Quick sentences loaded from API */
  quickSentences: QuickSentence[] = [];

  /** Download loading state per key */
  downloading: Record<string, boolean> = {};

  /** Checklist items loaded from API */
  checklist: ChecklistItem[] = [];
  checklistLoading = true;

  get checkedCount(): number {
    return this.checklist.filter(i => i.checked).length;
  }

  get progressPercent(): number {
    if (!this.checklist.length) return 0;
    return Math.round((this.checkedCount / this.checklist.length) * 100);
  }

  ngOnInit(): void {
    this.loadChecklist();
    this.loadQuickSentences();
  }

  // ── Downloads ────────────────────────────────────────

  onDownloadZip(): void {
    this.blobDownload('zip', this.api.downloadZipBlob(), 'etiquetador_hmm_entregables.zip', 'ZIP con todos los entregables');
  }

  onDownloadNotebook(): void {
    this.blobDownload('notebook', this.api.downloadNotebookBlob(), 'etiquetador_hmm_viterbi.ipynb', 'Jupyter Notebook');
  }

  onDownloadEmission(): void {
    this.blobDownload('emission', this.api.downloadEmissionExcelBlob(), 'tabla_emision.xlsx', 'Tabla de Emision');
  }

  onDownloadTransition(): void {
    this.blobDownload('transition', this.api.downloadTransitionExcelBlob(), 'tabla_transicion.xlsx', 'Tabla de Transicion');
  }

  onDownloadViterbi(sentence: QuickSentence): void {
    const key = 'viterbi_' + sentence.id;
    const safeName = sentence.sentence.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').trim().substring(0, 30).replace(/ /g, '_');
    this.blobDownload(key, this.api.downloadViterbiExcel(sentence.sentence), `viterbi_${safeName}.xlsx`, 'Matriz de Viterbi');
  }

  /** Generic blob download with loading state + toast */
  private blobDownload(key: string, obs: Observable<Blob>, filename: string, label: string): void {
    if (this.downloading[key]) return;
    this.downloading[key] = true;

    obs.subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        this.downloading[key] = false;
        this.toast.show('success', `Descarga completada: ${label}`);
      },
      error: () => {
        this.downloading[key] = false;
        this.toast.show('error', `Error al descargar: ${label}`);
      }
    });
  }

  // ── Checklist ────────────────────────────────────────

  private loadChecklist(): void {
    this.checklistLoading = true;
    const saved = this.loadChecklistState();

    this.api.getExportChecklist().subscribe({
      next: (res) => {
        this.checklist = res.items.map(item => ({
          ...item,
          checked: saved[item.id] ?? false,
        }));
        this.checklistLoading = false;
      },
      error: () => {
        this.checklistLoading = false;
      }
    });
  }

  private loadQuickSentences(): void {
    this.api.getQuickSentences().subscribe({
      next: (res) => {
        this.quickSentences = res.sentences;
      }
    });
  }

  /** Download ZIP and auto-check all checklist items */
  onGenerateAllAndVerify(): void {
    if (this.downloading['zip']) return;
    this.downloading['zip'] = true;

    this.api.downloadZipBlob().subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'etiquetador_hmm_entregables.zip';
        link.click();
        URL.revokeObjectURL(url);
        this.downloading['zip'] = false;

        // Auto-check all items
        for (const item of this.checklist) {
          item.checked = true;
        }
        this.onCheckChange();
        this.toast.show('success', 'ZIP descargado y checklist verificado al 100%');
      },
      error: () => {
        this.downloading['zip'] = false;
        this.toast.show('error', 'Error al generar el ZIP');
      }
    });
  }

  /** Toggle all checklist items on/off */
  onToggleAll(checked: boolean): void {
    for (const item of this.checklist) {
      item.checked = checked;
    }
    this.onCheckChange();
  }

  onCheckChange(): void {
    const state: Record<number, boolean> = {};
    for (const item of this.checklist) {
      state[item.id] = item.checked;
    }
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }

  private loadChecklistState(): Record<number, boolean> {
    try {
      const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}
