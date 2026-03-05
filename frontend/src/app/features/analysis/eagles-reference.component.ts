import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EaglesCategory, TagDescription } from '../../core/models/viterbi.model';

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
        <h1 class="text-2xl font-bold text-[#2F5496] dark:text-blue-300">Referencia de Etiquetas EAGLES</h1>
        <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">
          Catalogo completo del sistema de etiquetado morfosintactico EAGLES para el espanol.
          Consulta categorias, subcategorias y la estructura de cada etiqueta.
        </p>
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 1: CONSULTAR ETIQUETA                                -->
      <!-- ============================================================ -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#2F5496] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Consultar etiqueta
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-300">
          Introduce una etiqueta EAGLES para obtener su descripcion completa.
        </p>

        <div class="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            [(ngModel)]="tagQuery"
            placeholder="Ej: VMIP3S0, NCMS000, DA0MS0..."
            class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
                   px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#2F5496]
                   focus:border-transparent outline-none transition font-mono uppercase tracking-wider"
            (keydown.enter)="lookupTag()" />
          <button
            (click)="lookupTag()"
            [disabled]="lookingUp || !tagQuery.trim()"
            class="rounded-lg bg-[#2F5496] px-6 py-2.5 text-sm font-medium text-white
                   hover:bg-[#253F73] transition disabled:opacity-50 disabled:cursor-not-allowed
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
          <div class="mt-4 rounded-xl border border-[#2F5496] dark:border-blue-400/20 bg-[#2F5496]/5 dark:bg-[#2F5496]/10 dark:bg-blue-500/15 p-5 space-y-3">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center rounded-lg bg-[#2F5496] px-3 py-1.5 text-sm font-bold text-white font-mono tracking-wider">
                {{ tagResult.tag }}
              </span>
              <span class="text-sm font-medium text-[#2F5496] dark:text-blue-300 dark:text-blue-300">
                {{ tagResult.category }}
              </span>
            </div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              <span class="font-semibold">Descripcion:</span> {{ tagResult.description }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              <span class="font-semibold">Detalle completo:</span> {{ tagResult.full_description }}
            </p>
          </div>
        }

        <!-- Error -->
        @if (tagError) {
          <div class="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <p class="text-sm text-red-600 dark:text-red-400">{{ tagError }}</p>
          </div>
        }
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 2: EJEMPLOS COMUNES                                   -->
      <!-- ============================================================ -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#2F5496] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Ejemplos de etiquetas comunes
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-300">
          Etiquetas frecuentes del sistema EAGLES con su significado completo.
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-[#2F5496] dark:border-blue-400/20">
                <th class="text-left py-3 px-4 font-semibold text-[#2F5496] dark:text-blue-300">Etiqueta</th>
                <th class="text-left py-3 px-4 font-semibold text-[#2F5496] dark:text-blue-300">Categoria</th>
                <th class="text-left py-3 px-4 font-semibold text-[#2F5496] dark:text-blue-300">Descripcion</th>
              </tr>
            </thead>
            <tbody>
              @for (example of commonExamples; track example.tag; let odd = $odd) {
                <tr [class]="odd ? 'bg-gray-50 dark:bg-gray-750' : ''"
                    class="border-b border-gray-100 dark:border-gray-700 hover:bg-[#2F5496]/5 dark:hover:bg-[#2F5496]/10 dark:bg-blue-500/15 transition">
                  <td class="py-3 px-4">
                    <span class="inline-block rounded bg-gray-100 dark:bg-gray-700 px-2.5 py-1 font-mono text-xs font-bold text-[#2F5496] dark:text-blue-300 tracking-wider">
                      {{ example.tag }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">{{ example.category }}</td>
                  <td class="py-3 px-4 text-gray-600 dark:text-gray-300">{{ example.description }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 3: ESTRUCTURA DE LA ETIQUETA                          -->
      <!-- ============================================================ -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#2F5496] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          Estructura de la etiqueta EAGLES
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-300">
          Cada etiqueta EAGLES se compone de hasta 7 posiciones. La primera posicion indica la categoria
          gramatical y las siguientes posiciones codifican atributos morfologicos.
        </p>

        <!-- Diagrama visual de posiciones -->
        <div class="flex flex-wrap items-center justify-center gap-1 py-4">
          @for (pos of tagPositions; track $index; let i = $index) {
            <div class="flex flex-col items-center">
              <span class="text-xs text-gray-400 dark:text-gray-300 mb-1">Pos {{ i + 1 }}</span>
              <span class="w-14 h-14 flex items-center justify-center rounded-lg text-lg font-bold font-mono border-2"
                    [class]="pos.colorClass">
                {{ pos.example }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-300 mt-1 text-center max-w-[70px]">{{ pos.label }}</span>
            </div>
          }
        </div>

        <!-- Tabla de referencia rapida -->
        <div class="overflow-x-auto mt-4">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b-2 border-[#2F5496] dark:border-blue-400/20">
                <th class="text-left py-3 px-4 font-semibold text-[#2F5496] dark:text-blue-300">Posicion</th>
                <th class="text-left py-3 px-4 font-semibold text-[#2F5496] dark:text-blue-300">Atributo</th>
                <th class="text-left py-3 px-4 font-semibold text-[#2F5496] dark:text-blue-300">Valores posibles</th>
              </tr>
            </thead>
            <tbody>
              @for (row of structureRows; track row.position; let odd = $odd) {
                <tr [class]="odd ? 'bg-gray-50 dark:bg-gray-750' : ''"
                    class="border-b border-gray-100 dark:border-gray-700">
                  <td class="py-3 px-4 font-mono font-bold text-[#2F5496] dark:text-blue-300">{{ row.position }}</td>
                  <td class="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">{{ row.attribute }}</td>
                  <td class="py-3 px-4 text-gray-600 dark:text-gray-300">{{ row.values }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- SECCION 4: CATEGORIAS EAGLES                                  -->
      <!-- ============================================================ -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#2F5496] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Categorias gramaticales
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-300">
          Todas las categorias del sistema EAGLES. Haz clic en una categoria para ver sus subcategorias.
        </p>

        <app-loading-spinner [loading]="loadingCategories" message="Cargando categorias EAGLES..."></app-loading-spinner>

        <!-- Error al cargar -->
        @if (categoriesError) {
          <div class="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <p class="text-sm text-red-600 dark:text-red-400">{{ categoriesError }}</p>
            <button (click)="loadCategories()" class="mt-2 text-sm text-[#2F5496] dark:text-blue-300 hover:underline">Reintentar</button>
          </div>
        }

        <!-- Grid de categorias -->
        @if (!loadingCategories && categories.length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (cat of categories; track cat.code; let i = $index) {
              <div class="rounded-2xl shadow-sm border transition-all duration-200 cursor-pointer overflow-hidden"
                   [class]="getCategoryCardClasses(i)"
                   (click)="toggleCategory(cat.code)">

                <!-- Cabecera de la categoria -->
                <div class="p-5 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-10 h-10 flex items-center justify-center rounded-xl text-lg font-bold font-mono text-white"
                          [class]="getCategoryBadgeClass(i)">
                      {{ cat.code }}
                    </span>
                    <div>
                      <h3 class="font-semibold text-gray-800 dark:text-gray-100">{{ cat.name }}</h3>
                      <span class="text-xs text-gray-500 dark:text-gray-300">
                        {{ cat.subcategories.length }} subcategoria{{ cat.subcategories.length !== 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400 transition-transform duration-200"
                       [class.rotate-180]="expandedCategories.has(cat.code)"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <!-- Subcategorias (expandible) -->
                @if (expandedCategories.has(cat.code)) {
                  <div class="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 px-5 py-4">
                    @if (cat.subcategories.length === 0) {
                      <div class="text-sm text-gray-400 dark:text-gray-300 italic">
                        Sin subcategorias definidas.
                      </div>
                    }
                    <ul class="space-y-2">
                      @for (sub of cat.subcategories; track sub.code) {
                        <li class="flex items-center gap-2 text-sm">
                          <span class="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-700 font-mono font-bold text-xs text-[#2F5496] dark:text-blue-300">
                            {{ sub.code }}
                          </span>
                          <span class="text-gray-700 dark:text-gray-300">{{ sub.name }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Estado vacio -->
        @if (!loadingCategories && !categoriesError && categories.length === 0) {
          <div class="text-center py-12 text-gray-400 dark:text-gray-300">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-sm">No se encontraron categorias. Verifica que el servidor este activo.</p>
          </div>
        }
      </div>

    </div>
  `,
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

  expandedCategories = new Set<string>();

  // ── Ejemplos comunes ───────────────────────────────────────
  commonExamples = [
    { tag: 'VMIP3S0', category: 'Verbo', description: 'Verbo principal, indicativo, presente, 3a persona, singular' },
    { tag: 'NCMS000', category: 'Nombre', description: 'Nombre comun, masculino, singular' },
    { tag: 'DA0MS0', category: 'Determinante', description: 'Determinante, articulo, masculino, singular' },
    { tag: 'SPS00', category: 'Preposicion', description: 'Preposicion simple' },
    { tag: 'AQ0CS0', category: 'Adjetivo', description: 'Adjetivo calificativo, comun, singular' },
    { tag: 'PP3MSA00', category: 'Pronombre', description: 'Pronombre personal, 3a persona, masculino, singular, acusativo' },
    { tag: 'RG', category: 'Adverbio', description: 'Adverbio general' },
    { tag: 'CC', category: 'Conjuncion', description: 'Conjuncion coordinante' },
    { tag: 'CS', category: 'Conjuncion', description: 'Conjuncion subordinante' },
    { tag: 'Fp', category: 'Puntuacion', description: 'Signo de puntuacion: punto' },
    { tag: 'Fc', category: 'Puntuacion', description: 'Signo de puntuacion: coma' },
    { tag: 'Z', category: 'Numeral', description: 'Numeral (cifra)' },
    { tag: 'W', category: 'Fecha', description: 'Fecha u hora' },
    { tag: 'I', category: 'Interjeccion', description: 'Interjeccion' },
  ];

  // ── Posiciones de la etiqueta (diagrama visual) ────────────
  tagPositions = [
    { example: 'V', label: 'Categoria', colorClass: 'border-[#2F5496] dark:border-blue-400 bg-[#2F5496]/10 dark:bg-blue-500/15 text-[#2F5496] dark:text-blue-300' },
    { example: 'M', label: 'Subcategoria', colorClass: 'border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
    { example: 'I', label: 'Modo/Tipo', colorClass: 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
    { example: 'P', label: 'Tiempo', colorClass: 'border-sky-400 bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400' },
    { example: '3', label: 'Persona', colorClass: 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' },
    { example: 'S', label: 'Numero', colorClass: 'border-violet-400 bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400' },
    { example: '0', label: 'Genero', colorClass: 'border-gray-400 bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  ];

  // ── Filas de la tabla de estructura ────────────────────────
  structureRows = [
    { position: '1', attribute: 'Categoria', values: 'A (Adjetivo), C (Conjuncion), D (Determinante), F (Puntuacion), I (Interjeccion), N (Nombre), P (Pronombre), R (Adverbio), S (Preposicion), V (Verbo), W (Fecha), Z (Numeral)' },
    { position: '2', attribute: 'Subcategoria', values: 'Depende de la categoria. Ej: M (principal), A (auxiliar), Q (calificativo), C (comun), P (propio)...' },
    { position: '3', attribute: 'Modo / Tipo', values: 'I (indicativo), S (subjuntivo), M (imperativo), N (infinitivo), G (gerundio), P (participio)...' },
    { position: '4', attribute: 'Tiempo', values: 'P (presente), I (imperfecto), F (futuro), C (condicional), S (pasado)...' },
    { position: '5', attribute: 'Persona', values: '1 (primera), 2 (segunda), 3 (tercera), 0 (no aplica)' },
    { position: '6', attribute: 'Numero', values: 'S (singular), P (plural), N (invariable), 0 (no aplica)' },
    { position: '7', attribute: 'Genero', values: 'M (masculino), F (femenino), C (comun), 0 (no aplica)' },
  ];

  // ── Colores de fondo para tarjetas de categoria ────────────
  private cardBgClasses = [
    'bg-blue-50/80 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 hover:shadow-md hover:border-blue-300',
    'bg-emerald-50/80 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 hover:shadow-md hover:border-emerald-300',
    'bg-slate-50/80 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-slate-300',
    'bg-rose-50/80 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800 hover:shadow-md hover:border-rose-300',
    'bg-violet-50/80 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800 hover:shadow-md hover:border-violet-300',
    'bg-cyan-50/80 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800 hover:shadow-md hover:border-cyan-300',
    'bg-sky-50/80 dark:bg-sky-900/10 border-sky-200 dark:border-sky-800 hover:shadow-md hover:border-sky-300',
    'bg-teal-50/80 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800 hover:shadow-md hover:border-teal-300',
    'bg-pink-50/80 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800 hover:shadow-md hover:border-pink-300',
    'bg-indigo-50/80 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 hover:shadow-md hover:border-indigo-300',
    'bg-lime-50/80 dark:bg-lime-900/10 border-lime-200 dark:border-lime-800 hover:shadow-md hover:border-lime-300',
    'bg-fuchsia-50/80 dark:bg-fuchsia-900/10 border-fuchsia-200 dark:border-fuchsia-800 hover:shadow-md hover:border-fuchsia-300',
  ];

  private badgeClasses = [
    'bg-blue-600', 'bg-emerald-600', 'bg-slate-600', 'bg-rose-600',
    'bg-violet-600', 'bg-cyan-600', 'bg-sky-600', 'bg-teal-600',
    'bg-pink-600', 'bg-indigo-600', 'bg-lime-600', 'bg-fuchsia-600',
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
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

  // ── Expansion de categorias ────────────────────────────────

  toggleCategory(code: string): void {
    if (this.expandedCategories.has(code)) {
      this.expandedCategories.delete(code);
    } else {
      this.expandedCategories.add(code);
    }
  }

  // ── Clases CSS por categoria ───────────────────────────────

  getCategoryCardClasses(index: number): string {
    return this.cardBgClasses[index % this.cardBgClasses.length];
  }

  getCategoryBadgeClass(index: number): string {
    return this.badgeClasses[index % this.badgeClasses.length];
  }
}
