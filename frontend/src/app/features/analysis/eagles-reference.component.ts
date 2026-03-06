import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EaglesCategory, TagDescription, EaglesExample, EaglesPosition } from '../../core/models/viterbi.model';

@Component({
  selector: 'app-eagles-reference',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="space-y-8">

      <!-- ============================================================ -->
      <!-- ENCABEZADO                                                    -->
      <!-- ============================================================ -->
      <div>
        <h1 class="text-2xl font-bold text-[#04202C]">Referencia de Etiquetas EAGLES</h1>
        <p class="text-sm text-gray-700 mt-1">
          Catalogo completo del sistema de etiquetado morfosintactico EAGLES para el espanol.
          Consulta categorias, subcategorias y la estructura de cada etiqueta.
        </p>
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 1: CONSULTAR ETIQUETA                                -->
      <!-- ============================================================ -->
      <div class="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#04202C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Consultar etiqueta
        </h2>
        <p class="text-sm text-gray-700">
          Introduce una etiqueta EAGLES para obtener su descripcion completa.
        </p>

        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            [(ngModel)]="tagQuery"
            placeholder="Ej: VMIP3S0, NCMS000, DA0MS0..."
            class="flex-1 rounded-lg border border-gray-300 bg-white
                   px-4 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-[#04202C]
                   focus:border-transparent outline-none transition font-mono uppercase tracking-wider"
            (keydown.enter)="lookupTag()" />
          <button
            (click)="lookupTag()"
            [disabled]="lookingUp || !tagQuery.trim()"
            class="rounded-lg bg-[#04202C] px-6 py-2.5 text-sm font-medium text-white
                   hover:bg-[#04202C] transition disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2 whitespace-nowrap">
            @if (!lookingUp) {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            } @else {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            }
            {{ lookingUp ? 'Consultando...' : 'Consultar' }}
          </button>
        </div>

        <!-- Resultado de la consulta -->
        @if (tagResult) {
          <div class="mt-4 rounded-xl border border-[#04202C] bg-[#04202C]/5 p-5 space-y-3">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center rounded-lg bg-[#04202C] px-3 py-1.5 text-sm font-bold text-white font-mono tracking-wider">
                {{ tagResult.tag }}
              </span>
              <span class="text-sm font-medium text-[#04202C]">
                {{ tagResult.category }}
              </span>
            </div>
            <p class="text-sm text-gray-700">
              <span class="font-semibold">Descripcion:</span> {{ tagResult.description }}
            </p>
            <p class="text-sm text-gray-800">
              <span class="font-semibold">Detalle completo:</span> {{ tagResult.full_description }}
            </p>
          </div>
        }

        <!-- Error -->
        @if (tagError) {
          <div class="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p class="text-sm text-red-600">{{ tagError }}</p>
          </div>
        }
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 2: EJEMPLOS COMUNES                                   -->
      <!-- ============================================================ -->
      <div class="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#04202C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Ejemplos de etiquetas comunes
        </h2>
        <p class="text-sm text-gray-700">
          Etiquetas frecuentes del sistema EAGLES con su significado completo.
        </p>

        <app-loading-spinner [loading]="loadingExamples" message="Cargando ejemplos..."></app-loading-spinner>

        @if (examplesError) {
          <div class="rounded-xl border border-red-200 bg-red-50 p-4">
            <p class="text-sm text-red-600">{{ examplesError }}</p>
            <button (click)="loadExamples()" class="mt-2 text-sm text-[#04202C] hover:underline">Reintentar</button>
          </div>
        }

        @if (!loadingExamples && commonExamples.length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b-2 border-[#04202C]">
                  <th class="text-left py-3 px-4 font-semibold text-[#04202C]">Etiqueta</th>
                  <th class="text-left py-3 px-4 font-semibold text-[#04202C]">Categoria</th>
                  <th class="text-left py-3 px-4 font-semibold text-[#04202C]">Descripcion</th>
                </tr>
              </thead>
              <tbody>
                @for (example of commonExamples; track example.id; let odd = $odd) {
                  <tr [class]="odd ? 'bg-gray-50' : ''"
                      class="border-b border-gray-100 hover:bg-[#04202C]/5 transition cursor-pointer"
                      (click)="openTagDetail(example.tag)">
                    <td class="py-3 px-4">
                      <span class="inline-block rounded bg-gray-100 px-2.5 py-1 font-mono text-xs font-bold text-[#04202C] tracking-wider">
                        {{ example.tag }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-gray-700 font-medium">{{ example.category }}</td>
                    <td class="py-3 px-4 text-gray-800">{{ example.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="text-xs text-gray-500 mt-1">Haz clic en una etiqueta para ver su desglose completo.</p>
        }

        @if (!loadingExamples && !examplesError && commonExamples.length === 0) {
          <p class="text-sm text-gray-500 text-center py-4">No hay ejemplos disponibles.</p>
        }
      </div>

      <!-- ============================================================ -->
      <!-- DIALOG: DETALLE DE ETIQUETA (top layer nativo)                -->
      <!-- ============================================================ -->
      <dialog #tagDialog class="tag-dialog" (click)="onDialogBackdropClick($event)">
        <div class="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl mx-auto">

          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div class="flex items-center gap-3">
              @if (modalDetail) {
                <span class="inline-flex items-center rounded-lg bg-[#04202C] px-3 py-1.5 text-sm font-bold text-white font-mono tracking-wider">
                  {{ modalDetail.tag }}
                </span>
                <span class="text-sm font-medium text-[#04202C]">{{ modalDetail.category }}</span>
              }
              @if (modalLoading) {
                <span class="text-sm text-gray-500">Cargando...</span>
              }
            </div>
            <button (click)="closeModal()"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-5">
            @if (modalLoading) {
              <div class="flex items-center justify-center py-8">
                <svg class="w-6 h-6 animate-spin text-[#04202C]" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              </div>
            }

            @if (modalError) {
              <div class="rounded-xl border border-red-200 bg-red-50 p-4">
                <p class="text-sm text-red-600">{{ modalError }}</p>
              </div>
            }

            @if (modalDetail && !modalLoading) {
              <!-- Descripcion -->
              <div class="space-y-2">
                <h3 class="text-sm font-semibold text-[#04202C]">Descripcion</h3>
                <p class="text-sm text-gray-700">{{ modalDetail.description }}</p>
              </div>

              <!-- Detalle completo -->
              <div class="space-y-2">
                <h3 class="text-sm font-semibold text-[#04202C]">Detalle completo</h3>
                <p class="text-sm text-gray-800">{{ modalDetail.full_description }}</p>
              </div>

              <!-- Desglose por posicion -->
              @if (modalDetail.positions && modalDetail.positions.length > 0) {
                <div class="space-y-3">
                  <h3 class="text-sm font-semibold text-[#04202C]">Desglose por posicion</h3>

                  <!-- Diagrama visual del tag -->
                  <div class="flex flex-wrap items-center justify-center gap-1 py-2">
                    @for (p of modalDetail.positions; track $index) {
                      <div class="flex flex-col items-center">
                        <span class="text-[10px] text-gray-500 mb-0.5">{{ p.position_name || 'Pos ' + ($index + 1) }}</span>
                        <span class="w-10 h-10 flex items-center justify-center rounded-lg text-base font-bold font-mono border-2 border-[#04202C]/20 bg-[#04202C]/5 text-[#04202C]">
                          {{ p.char }}
                        </span>
                      </div>
                    }
                  </div>

                  <!-- Tabla de posiciones -->
                  <div class="overflow-x-auto rounded-xl border border-gray-200">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="bg-gray-50 border-b border-gray-200">
                          <th class="text-left py-2 px-3 font-semibold text-[#04202C] text-xs">Pos</th>
                          <th class="text-left py-2 px-3 font-semibold text-[#04202C] text-xs">Caracter</th>
                          <th class="text-left py-2 px-3 font-semibold text-[#04202C] text-xs">Atributo</th>
                          <th class="text-left py-2 px-3 font-semibold text-[#04202C] text-xs">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (p of modalDetail.positions; track $index; let odd = $odd) {
                          <tr [class]="odd ? 'bg-gray-50/50' : ''" class="border-b border-gray-100">
                            <td class="py-2 px-3 font-mono font-bold text-[#04202C] text-xs">{{ $index + 1 }}</td>
                            <td class="py-2 px-3">
                              <span class="inline-flex w-7 h-7 items-center justify-center rounded bg-[#04202C]/10 font-mono font-bold text-sm text-[#04202C]">
                                {{ p.char }}
                              </span>
                            </td>
                            <td class="py-2 px-3 text-gray-600 text-xs">{{ p.position_name || '-' }}</td>
                            <td class="py-2 px-3 text-gray-800 font-medium text-xs">{{ p.description || '-' }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      </dialog>

      <!-- ============================================================ -->
      <!-- DIALOG: DETALLE DE POSICION                                   -->
      <!-- ============================================================ -->
      <dialog #posDialog class="tag-dialog" (click)="onPosDialogBackdropClick($event)">
        <div class="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl mx-auto">

          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div class="flex items-center gap-3">
              @if (positionDetail) {
                <span class="w-10 h-10 flex items-center justify-center rounded-xl text-lg font-bold font-mono border-2"
                      [class]="positionDetail.color_class">
                  {{ positionDetail.example_char }}
                </span>
                <div>
                  <span class="text-sm font-semibold text-[#04202C]">Posicion {{ positionDetail.position }}</span>
                  <p class="text-xs text-gray-600">{{ positionDetail.attribute }}</p>
                </div>
              }
            </div>
            <button (click)="closePosModal()"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-4">
            @if (positionDetail) {
              <div class="space-y-2">
                <h3 class="text-sm font-semibold text-[#04202C]">Valores posibles</h3>
                <div class="space-y-1.5">
                  @for (val of parsePossibleValues(positionDetail.possible_values); track $index) {
                    <div class="flex items-start gap-2 text-sm rounded-lg bg-gray-50 px-3 py-2">
                      @if (val.code) {
                        <span class="inline-flex w-7 h-7 flex-shrink-0 items-center justify-center rounded-md bg-[#04202C]/10 font-mono font-bold text-xs text-[#04202C]">
                          {{ val.code }}
                        </span>
                      }
                      <span class="text-gray-800">{{ val.label }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="pt-2 border-t border-gray-100">
                <p class="text-xs text-gray-500">
                  Ejemplo: el caracter
                  <span class="font-mono font-bold text-[#04202C]">{{ positionDetail.example_char }}</span>
                  en la posicion {{ positionDetail.position }} indica
                  <span class="font-medium text-gray-700">{{ getExampleValueLabel(positionDetail) }}</span>.
                </p>
              </div>
            }
          </div>
        </div>
      </dialog>

      <!-- ============================================================ -->
      <!-- SECCION 3: ESTRUCTURA DE LA ETIQUETA                          -->
      <!-- ============================================================ -->
      <div class="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#04202C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          Estructura de la etiqueta EAGLES
        </h2>
        <p class="text-sm text-gray-700">
          Cada etiqueta EAGLES se compone de hasta 7 posiciones. La primera posicion indica la categoria
          gramatical y las siguientes posiciones codifican atributos morfologicos.
        </p>

        <app-loading-spinner [loading]="loadingPositions" message="Cargando estructura..."></app-loading-spinner>

        @if (positionsError) {
          <div class="rounded-xl border border-red-200 bg-red-50 p-4">
            <p class="text-sm text-red-600">{{ positionsError }}</p>
            <button (click)="loadPositions()" class="mt-2 text-sm text-[#04202C] hover:underline">Reintentar</button>
          </div>
        }

        @if (!loadingPositions && tagPositions.length > 0) {
          <!-- Diagrama visual de posiciones -->
          <div class="flex flex-wrap items-center justify-center gap-1 py-4">
            @for (pos of tagPositions; track pos.id; let i = $index) {
              <div class="flex flex-col items-center cursor-pointer group" (click)="openPositionDetail(pos)">
                <span class="text-xs text-gray-800 mb-1">Pos {{ pos.position }}</span>
                <span class="w-14 h-14 flex items-center justify-center rounded-lg text-lg font-bold font-mono border-2 transition group-hover:scale-110 group-hover:shadow-md"
                      [class]="pos.color_class">
                  {{ pos.example_char }}
                </span>
                <span class="text-xs text-gray-700 mt-1 text-center max-w-[70px]">{{ pos.attribute }}</span>
              </div>
            }
          </div>

          <!-- Tabla de referencia rapida -->
          <div class="overflow-x-auto mt-4">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b-2 border-[#04202C]">
                  <th class="text-left py-3 px-4 font-semibold text-[#04202C]">Posicion</th>
                  <th class="text-left py-3 px-4 font-semibold text-[#04202C]">Atributo</th>
                  <th class="text-left py-3 px-4 font-semibold text-[#04202C]">Valores posibles</th>
                </tr>
              </thead>
              <tbody>
                @for (row of tagPositions; track row.id; let odd = $odd) {
                  <tr [class]="odd ? 'bg-gray-50' : ''"
                      class="border-b border-gray-100 hover:bg-[#04202C]/5 transition cursor-pointer"
                      (click)="openPositionDetail(row)">
                    <td class="py-3 px-4 font-mono font-bold text-[#04202C]">{{ row.position }}</td>
                    <td class="py-3 px-4 text-gray-700 font-medium">{{ row.attribute }}</td>
                    <td class="py-3 px-4 text-gray-800 truncate max-w-xs">{{ row.possible_values }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="text-xs text-gray-500 mt-1">Haz clic en una posicion para ver todos sus valores posibles.</p>
        }

        @if (!loadingPositions && !positionsError && tagPositions.length === 0) {
          <p class="text-sm text-gray-500 text-center py-4">No hay datos de estructura disponibles.</p>
        }
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 4: CATEGORIAS EAGLES                                  -->
      <!-- ============================================================ -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#04202C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Categorias gramaticales
        </h2>
        <p class="text-sm text-gray-700">
          Todas las categorias del sistema EAGLES. Haz clic en una categoria para ver sus subcategorias.
        </p>

        <app-loading-spinner [loading]="loadingCategories" message="Cargando categorias EAGLES..."></app-loading-spinner>

        <!-- Error al cargar -->
        @if (categoriesError) {
          <div class="rounded-xl border border-red-200 bg-red-50 p-4">
            <p class="text-sm text-red-600">{{ categoriesError }}</p>
            <button (click)="loadCategories()" class="mt-2 text-sm text-[#04202C] hover:underline">Reintentar</button>
          </div>
        }

        <!-- Grid de categorias -->
        @if (!loadingCategories && categories.length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (cat of categories; track cat.code; let i = $index) {
              <div class="rounded-2xl shadow-sm border transition-all duration-200 cursor-pointer overflow-hidden hover:shadow-md"
                   [class]="getCategoryCardClasses(i)"
                   (click)="openCategoryDetail(cat, i)">
                <div class="p-5 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-10 h-10 flex items-center justify-center rounded-xl text-lg font-bold font-mono text-white"
                          [class]="getCategoryBadgeClass(i)">
                      {{ cat.code }}
                    </span>
                    <div>
                      <h3 class="font-semibold text-gray-800">{{ cat.name }}</h3>
                      <span class="text-xs text-gray-700">
                        {{ cat.subcategories.length }} subcategoria{{ cat.subcategories.length !== 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            }
          </div>
          <p class="text-xs text-gray-500 mt-1">Haz clic en una categoria para ver sus subcategorias.</p>
        }

        <!-- Estado vacio -->
        @if (!loadingCategories && !categoriesError && categories.length === 0) {
          <div class="text-center py-12 text-gray-800">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-sm">No se encontraron categorias. Verifica que el servidor este activo.</p>
          </div>
        }
      </div>

      <!-- ============================================================ -->
      <!-- DIALOG: DETALLE DE CATEGORIA                                  -->
      <!-- ============================================================ -->
      <dialog #catDialog class="tag-dialog" (click)="onCatDialogBackdropClick($event)">
        <div class="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl mx-auto">

          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div class="flex items-center gap-3">
              @if (categoryDetail) {
                <span class="w-10 h-10 flex items-center justify-center rounded-xl text-lg font-bold font-mono text-white"
                      [class]="getCategoryBadgeClass(categoryDetailIndex)">
                  {{ categoryDetail.code }}
                </span>
                <div>
                  <span class="text-sm font-semibold text-[#04202C]">{{ categoryDetail.name }}</span>
                  <p class="text-xs text-gray-600">Codigo: {{ categoryDetail.code }}</p>
                </div>
              }
            </div>
            <button (click)="closeCatModal()"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-4">
            @if (categoryDetail) {
              <div class="space-y-2">
                <h3 class="text-sm font-semibold text-[#04202C]">
                  Subcategorias
                  <span class="font-normal text-gray-500">({{ categoryDetail.subcategories.length }})</span>
                </h3>

                @if (categoryDetail.subcategories.length === 0) {
                  <p class="text-sm text-gray-500 italic">Esta categoria no tiene subcategorias definidas.</p>
                }

                <div class="space-y-1.5">
                  @for (sub of categoryDetail.subcategories; track sub.code) {
                    <div class="flex items-center gap-3 text-sm rounded-lg bg-gray-50 px-3 py-2.5 hover:bg-gray-100 transition cursor-pointer"
                         (click)="fillLookupFromCategory(sub.code)">
                      <span class="inline-flex w-9 h-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#04202C]/10 font-mono font-bold text-sm text-[#04202C]">
                        {{ sub.code }}
                      </span>
                      <span class="text-gray-800">{{ sub.name }}</span>
                      <svg class="w-3.5 h-3.5 text-gray-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  }
                </div>
              </div>

              <div class="pt-2 border-t border-gray-100">
                <p class="text-xs text-gray-500">
                  Haz clic en una subcategoria para consultarla en el buscador de etiquetas.
                </p>
              </div>
            }
          </div>
        </div>
      </dialog>

    </div>
  `,
  styles: [`
    .tag-dialog {
      border: none;
      border-radius: 0;
      padding: 0;
      margin: 0;
      background: transparent;
      max-width: none;
      max-height: none;
      overflow: visible;
    }
    .tag-dialog[open] {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tag-dialog::backdrop {
      background: rgba(4, 32, 44, 0.45);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .tag-dialog[open] {
      animation: dialogFadeIn 200ms ease;
    }
    @keyframes dialogFadeIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: none; }
    }
  `],
})
export class EaglesReferenceComponent implements OnInit {

  // ── Estado ─────────────────────────────────────────────────
  categories: EaglesCategory[] = [];
  loadingCategories = false;
  categoriesError = '';

  tagQuery = '';
  tagResult: TagDescription | null = null;
  tagError = '';
  lookingUp = false;


  // ── Ejemplos comunes (desde API) ───────────────────────────
  commonExamples: EaglesExample[] = [];
  loadingExamples = false;
  examplesError = '';

  // ── Posiciones de la etiqueta (desde API) ──────────────────
  tagPositions: EaglesPosition[] = [];
  loadingPositions = false;
  positionsError = '';

  // ── Modal detalle de etiqueta (native <dialog>) ──────────
  @ViewChild('tagDialog') tagDialog!: ElementRef<HTMLDialogElement>;
  modalLoading = false;
  modalError = '';
  modalDetail: any = null;

  // ── Modal detalle de posicion (native <dialog>) ─────────
  @ViewChild('posDialog') posDialog!: ElementRef<HTMLDialogElement>;
  positionDetail: EaglesPosition | null = null;

  // ── Modal detalle de categoria (native <dialog>) ────────
  @ViewChild('catDialog') catDialog!: ElementRef<HTMLDialogElement>;
  categoryDetail: EaglesCategory | null = null;
  categoryDetailIndex = 0;

  // ── Colores de fondo para tarjetas de categoria ────────────
  private cardBgClasses = [
    'bg-violet-50/80 border-violet-200 hover:shadow-md hover:border-violet-300',
    'bg-emerald-50/80 border-emerald-200 hover:shadow-md hover:border-emerald-300',
    'bg-slate-50/80 border-slate-200 hover:shadow-md hover:border-slate-300',
    'bg-rose-50/80 border-rose-200 hover:shadow-md hover:border-rose-300',
    'bg-violet-50/80 border-violet-200 hover:shadow-md hover:border-violet-300',
    'bg-cyan-50/80 border-cyan-200 hover:shadow-md hover:border-cyan-300',
    'bg-sky-50/80 border-sky-200 hover:shadow-md hover:border-sky-300',
    'bg-teal-50/80 border-teal-200 hover:shadow-md hover:border-teal-300',
    'bg-pink-50/80 border-pink-200 hover:shadow-md hover:border-pink-300',
    'bg-indigo-50/80 border-indigo-200 hover:shadow-md hover:border-indigo-300',
    'bg-lime-50/80 border-lime-200 hover:shadow-md hover:border-lime-300',
    'bg-fuchsia-50/80 border-fuchsia-200 hover:shadow-md hover:border-fuchsia-300',
  ];

  private badgeClasses = [
    'bg-blue-600', 'bg-emerald-600', 'bg-slate-600', 'bg-rose-600',
    'bg-violet-600', 'bg-cyan-600', 'bg-sky-600', 'bg-teal-600',
    'bg-pink-600', 'bg-indigo-600', 'bg-lime-600', 'bg-fuchsia-600',
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadExamples();
    this.loadPositions();
  }

  // ── Carga de categorias ────────────────────────────────────

  loadCategories(): void {
    this.loadingCategories = true;
    this.categoriesError = '';
    this.apiService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.categories;
        this.loadingCategories = false;
      },
      error: (err) => {
        this.categoriesError = 'No se pudieron cargar las categorias. Verifica que el servidor este en ejecucion.';
        this.loadingCategories = false;
        console.error('Error al cargar categorias EAGLES:', err);
      },
    });
  }

  // ── Carga de ejemplos ─────────────────────────────────────

  loadExamples(): void {
    this.loadingExamples = true;
    this.examplesError = '';
    this.apiService.getEaglesExamples().subscribe({
      next: (res) => {
        this.commonExamples = res.examples;
        this.loadingExamples = false;
      },
      error: (err) => {
        this.examplesError = 'No se pudieron cargar los ejemplos.';
        this.loadingExamples = false;
        console.error('Error al cargar ejemplos EAGLES:', err);
      },
    });
  }

  // ── Carga de posiciones ──────────────────────────────────

  loadPositions(): void {
    this.loadingPositions = true;
    this.positionsError = '';
    this.apiService.getEaglesPositions().subscribe({
      next: (res) => {
        this.tagPositions = res.positions;
        this.loadingPositions = false;
      },
      error: (err) => {
        this.positionsError = 'No se pudieron cargar las posiciones.';
        this.loadingPositions = false;
        console.error('Error al cargar posiciones EAGLES:', err);
      },
    });
  }

  // ── Modal detalle de etiqueta ──────────────────────────────

  openTagDetail(tag: string): void {
    this.modalLoading = true;
    this.modalError = '';
    this.modalDetail = null;
    this.tagDialog.nativeElement.showModal();
    document.body.style.overflow = 'hidden';

    this.apiService.describeTag(tag).subscribe({
      next: (result) => {
        this.modalDetail = result;
        this.modalLoading = false;
      },
      error: (err) => {
        this.modalError = 'No se pudo obtener el detalle de la etiqueta.';
        this.modalLoading = false;
        console.error('Error al obtener detalle:', err);
      },
    });
  }

  closeModal(): void {
    this.tagDialog.nativeElement.close();
    document.body.style.overflow = '';
    this.modalDetail = null;
    this.modalError = '';
  }

  onDialogBackdropClick(event: MouseEvent): void {
    if (event.target === this.tagDialog.nativeElement) {
      this.closeModal();
    }
  }

  // ── Modal detalle de posicion ────────────────────────────

  openPositionDetail(pos: EaglesPosition): void {
    this.positionDetail = pos;
    this.posDialog.nativeElement.showModal();
    document.body.style.overflow = 'hidden';
  }

  closePosModal(): void {
    this.posDialog.nativeElement.close();
    document.body.style.overflow = '';
    this.positionDetail = null;
  }

  onPosDialogBackdropClick(event: MouseEvent): void {
    if (event.target === this.posDialog.nativeElement) {
      this.closePosModal();
    }
  }

  parsePossibleValues(values: string): { code: string; label: string }[] {
    return values.split(',').map(v => {
      const trimmed = v.trim();
      const match = trimmed.match(/^([A-Z0-9])\s*\((.+)\)$/i);
      if (match) {
        return { code: match[1], label: match[2].trim() };
      }
      return { code: '', label: trimmed };
    }).filter(v => v.label);
  }

  getExampleValueLabel(pos: EaglesPosition): string {
    const parsed = this.parsePossibleValues(pos.possible_values);
    const found = parsed.find(v => v.code === pos.example_char);
    return found ? found.label : pos.attribute;
  }

  // ── Consulta de etiqueta ───────────────────────────────────

  lookupTag(): void {
    const tag = this.tagQuery.trim().toUpperCase();
    if (!tag) return;

    this.lookingUp = true;
    this.tagResult = null;
    this.tagError = '';

    this.apiService.describeTag(tag).subscribe({
      next: (result) => {
        this.tagResult = result;
        this.lookingUp = false;
      },
      error: (err) => {
        this.tagError = err.error?.detail
          || 'No se pudo describir la etiqueta. Verifica que sea una etiqueta EAGLES valida.';
        this.lookingUp = false;
        console.error('Error al consultar etiqueta:', err);
      },
    });
  }

  // ── Modal detalle de categoria ─────────────────────────────

  openCategoryDetail(cat: EaglesCategory, index: number): void {
    this.categoryDetail = cat;
    this.categoryDetailIndex = index;
    this.catDialog.nativeElement.showModal();
    document.body.style.overflow = 'hidden';
  }

  closeCatModal(): void {
    this.catDialog.nativeElement.close();
    document.body.style.overflow = '';
    this.categoryDetail = null;
  }

  onCatDialogBackdropClick(event: MouseEvent): void {
    if (event.target === this.catDialog.nativeElement) {
      this.closeCatModal();
    }
  }

  fillLookupFromCategory(subCode: string): void {
    this.closeCatModal();
    this.tagQuery = subCode;
    this.lookupTag();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Clases CSS por categoria ───────────────────────────────

  getCategoryCardClasses(index: number): string {
    return this.cardBgClasses[index % this.cardBgClasses.length];
  }

  getCategoryBadgeClass(index: number): string {
    return this.badgeClasses[index % this.badgeClasses.length];
  }
}
