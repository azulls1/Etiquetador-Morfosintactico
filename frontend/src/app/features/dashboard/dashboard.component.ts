import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ApiService } from '../../core/services/api.service';
import { CorpusStats } from '../../core/models/corpus.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, DecimalPipe, LoadingSpinnerComponent],
  template: `
    <!-- Hero Section — Glassmorphism card -->
    <section class="hero-card relative overflow-hidden rounded-2xl mx-0 mb-10">
      <!-- Subtle decorative elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-24 -right-24 w-80 h-80 bg-violet-400/8 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-32 -left-16 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl"></div>
        <div class="absolute inset-0 opacity-[0.02]" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;"></div>
      </div>

      <div class="relative px-6 sm:px-10 py-12 md:py-16 text-center">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-[11px] font-medium text-violet-100 tracking-wide">PLN — UNIR 2026</span>
        </div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Etiquetador Morfosintactico
          <span class="block text-white/70 text-xl sm:text-2xl md:text-3xl font-medium mt-2">HMM + Viterbi</span>
        </h1>
        <p class="text-sm sm:text-base text-violet-100/80 max-w-2xl mx-auto mb-2 leading-relaxed font-light">
          Modelo Oculto de Markov para el etiquetado de partes del discurso (POS Tagging)
          con el corpus EAGLES en espanol
        </p>
        <p class="text-xs text-white/50 max-w-xl mx-auto">
          Actividad de la asignatura Procesamiento del Lenguaje Natural &mdash;
          Master Universitario en Inteligencia Artificial &mdash; UNIR
        </p>
        <p class="text-xl text-white font-bold max-w-2xl mx-auto mt-5">
          Equipo 1073F
        </p>
        <p class="text-base text-white max-w-2xl mx-auto mt-1">
          Adonai Samael Hernandez Mata &middot; Diego Alfonso Najera Ortiz &middot; Mauricio Alberto Alvares Aspeitia &middot; Cesar Ivan Martinez Perez
        </p>
      </div>
    </section>

    <!-- API Status Banner -->
    <div class="mb-10" role="status" aria-live="polite">
      <div class="rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border shadow-soft"
           [class]="loadingHealth ? 'bg-white/80 border-slate-200/60' : apiOnline ? 'bg-emerald-50/60 border-emerald-200/60' : 'bg-red-50/60 border-red-200/60'">
        <div class="flex items-center gap-3">
          <span class="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  [class]="loadingHealth ? 'bg-slate-400' : apiOnline ? 'bg-emerald-400' : 'bg-red-400'"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5"
                  [class]="loadingHealth ? 'bg-slate-400' : apiOnline ? 'bg-emerald-500' : 'bg-red-500'"></span>
          </span>
          <span class="text-sm font-medium"
                [class]="loadingHealth ? 'text-gray-700' : apiOnline ? 'text-emerald-700' : 'text-red-700'">
            {{ loadingHealth ? 'Verificando conexion con la API...' : (apiOnline ? 'API conectada y funcionando correctamente' : 'No se puede conectar con la API') }}
          </span>
        </div>
        <span class="text-[11px] px-3 py-1 rounded-full font-mono"
              [class]="loadingHealth ? 'bg-slate-100 text-gray-700' : apiOnline ? 'bg-emerald-100/60 text-emerald-700' : 'bg-red-100/60 text-red-700'">
          {{ environment.apiUrl }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <app-loading-spinner
      [loading]="loadingStats"
      message="Cargando estadisticas del corpus...">
    </app-loading-spinner>

    <!-- Main Content -->
    @if (!loadingStats) {
    <div>

      <!-- Status Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12 stagger-children">
        <!-- Corpus Status -->
        <div class="card-base p-5 animate-fadeInUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-800">Corpus</span>
            <span class="w-8 h-8 rounded-lg flex items-center justify-center"
                  [class]="corpusLoaded ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-400'">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (corpusLoaded) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                }
              </svg>
            </span>
          </div>
          <p class="text-lg font-semibold" [class]="corpusLoaded ? 'text-emerald-600' : 'text-red-500'">
            {{ corpusLoaded ? 'Cargado' : 'No cargado' }}
          </p>
        </div>

        <!-- Model Status -->
        <div class="card-base p-5 animate-fadeInUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-800">Modelo</span>
            <span class="w-8 h-8 rounded-lg flex items-center justify-center"
                  [class]="modelTrained ? 'bg-emerald-50 text-emerald-500' : 'bg-violet-50 text-violet-400'">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (modelTrained) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01"/>
                }
              </svg>
            </span>
          </div>
          <p class="text-lg font-semibold" [class]="modelTrained ? 'text-emerald-600' : 'text-violet-500'">
            {{ modelTrained ? 'Entrenado' : 'Sin entrenar' }}
          </p>
        </div>

        <!-- Total Tokens -->
        <div class="card-base p-5 animate-fadeInUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-800">Tokens</span>
            <span class="w-8 h-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
            </span>
          </div>
          <p class="text-2xl font-semibold text-slate-800">{{ stats?.total_tokens | number:'1.0-0' }}</p>
        </div>

        <!-- Total Sentences -->
        <div class="card-base p-5 animate-fadeInUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-800">Oraciones</span>
            <span class="w-8 h-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
            </span>
          </div>
          <p class="text-2xl font-semibold text-slate-800">{{ stats?.total_sentences | number:'1.0-0' }}</p>
        </div>

        <!-- Unique Tags -->
        <div class="card-base p-5 animate-fadeInUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-800">Etiquetas</span>
            <span class="w-8 h-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </span>
          </div>
          <p class="text-2xl font-semibold text-slate-800">{{ stats?.unique_tags | number:'1.0-0' }}</p>
        </div>

        <!-- Unique Words -->
        <div class="card-base p-5 animate-fadeInUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-800">Palabras</span>
            <span class="w-8 h-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
              </svg>
            </span>
          </div>
          <p class="text-2xl font-semibold text-slate-800">{{ stats?.unique_words | number:'1.0-0' }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-12">
        <h2 class="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Acciones Rapidas
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">

          <!-- Cargar Corpus -->
          <a routerLink="/corpus"
             class="group card-base p-6 block animate-fadeInUp">
            <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white group-hover:shadow-blue transition-all duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            </div>
            <h3 class="font-semibold text-slate-800 mb-1 text-sm">Cargar Corpus</h3>
            <p class="text-xs text-gray-800 leading-relaxed">Carga y procesa los archivos del corpus EAGLES para extraer tokens y etiquetas.</p>
            <span class="absolute top-5 right-5 text-gray-700 group-hover:text-violet-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </a>

          <!-- Entrenar Modelo -->
          <a routerLink="/probabilities"
             class="group card-base p-6 block animate-fadeInUp">
            <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white group-hover:shadow-blue transition-all duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-slate-800 mb-1 text-sm">Entrenar Modelo</h3>
            <p class="text-xs text-gray-800 leading-relaxed">Calcula las probabilidades de emision y transicion del modelo HMM.</p>
            <span class="absolute top-5 right-5 text-gray-700 group-hover:text-violet-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </a>

          <!-- Etiquetar Oracion -->
          <a routerLink="/viterbi"
             class="group card-base p-6 block animate-fadeInUp">
            <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white group-hover:shadow-blue transition-all duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-slate-800 mb-1 text-sm">Etiquetar Oracion</h3>
            <p class="text-xs text-gray-800 leading-relaxed">Aplica el algoritmo de Viterbi para etiquetar cualquier oracion en espanol.</p>
            <span class="absolute top-5 right-5 text-gray-700 group-hover:text-violet-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </a>

          <!-- Descargar Entregables -->
          <a routerLink="/exports"
             class="group card-base p-6 block animate-fadeInUp">
            <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white group-hover:shadow-blue transition-all duration-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-slate-800 mb-1 text-sm">Descargar Entregables</h3>
            <p class="text-xs text-gray-800 leading-relaxed">Descarga todos los archivos requeridos: tablas Excel, matrices y notebook.</p>
            <span class="absolute top-5 right-5 text-gray-700 group-hover:text-violet-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </a>
        </div>
      </div>

      <!-- Required Sentences Section -->
      <div class="mb-12">
        <h2 class="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
          Oraciones Requeridas por la Actividad
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Sentence 1 -->
          <div class="card-base p-6">
            <div class="flex items-start gap-3 mb-4">
              <span class="flex-shrink-0 w-8 h-8 gradient-primary text-white rounded-lg flex items-center justify-center text-sm font-semibold shadow-blue">1</span>
              <div>
                <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-800 block mb-1">Oracion A</span>
                <p class="text-base font-medium text-slate-800 italic">
                  &laquo;Habla con el enfermo grave de trasplantes.&raquo;
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-800 mb-4 leading-relaxed">
              Oracion donde <strong class="text-gray-800">&laquo;habla&raquo;</strong> funciona como <em>verbo</em>
              y <strong class="text-gray-800">&laquo;grave&raquo;</strong> como <em>adjetivo</em> que modifica a &laquo;enfermo&raquo;.
            </p>
            <a routerLink="/viterbi"
               [queryParams]="{ sentence: 'Habla con el enfermo grave de trasplantes.' }"
               class="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-medium rounded-lg shadow-blue hover:shadow-blue-lg hover:-translate-y-0.5 transition-all duration-300">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Etiquetar con Viterbi
            </a>
          </div>

          <!-- Sentence 2 -->
          <div class="card-base p-6">
            <div class="flex items-start gap-3 mb-4">
              <span class="flex-shrink-0 w-8 h-8 gradient-accent text-white rounded-lg flex items-center justify-center text-sm font-semibold shadow-blue">2</span>
              <div>
                <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-800 block mb-1">Oracion B</span>
                <p class="text-base font-medium text-slate-800 italic">
                  &laquo;El enfermo grave habla de trasplantes.&raquo;
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-800 mb-4 leading-relaxed">
              Oracion donde <strong class="text-gray-800">&laquo;habla&raquo;</strong> funciona como <em>sustantivo</em>
              y <strong class="text-gray-800">&laquo;enfermo&raquo;</strong> como <em>sustantivo</em> modificado por el adjetivo &laquo;grave&raquo;.
            </p>
            <a routerLink="/viterbi"
               [queryParams]="{ sentence: 'El enfermo grave habla de trasplantes.' }"
               class="inline-flex items-center gap-2 px-4 py-2 gradient-accent text-white text-sm font-medium rounded-lg shadow-blue hover:shadow-blue-lg hover:-translate-y-0.5 transition-all duration-300">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Etiquetar con Viterbi
            </a>
          </div>
        </div>
      </div>

      <!-- Deliverables Checklist -->
      <div class="mb-12">
        <h2 class="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          Lista de Entregables de la Actividad
        </h2>
        <div class="card-base overflow-hidden">
          <div class="divide-y divide-slate-100">
            @for (item of deliverables; track item.name; let i = $index) {
            <div class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
              <span class="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
                    [class]="item.available ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-gray-700'">
                @if (item.available) {
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                } @else {
                  <span>{{ i + 1 }}</span>
                }
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-700">{{ item.name }}</p>
                <p class="text-xs text-gray-800">{{ item.description }}</p>
              </div>
              <span class="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full font-medium"
                    [class]="item.available ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-gray-700'">
                {{ item.available ? 'Disponible' : 'Pendiente' }}
              </span>
            </div>
          }
          </div>
        </div>
      </div>

      <!-- Workflow Steps -->
      <div class="mb-10">
        <h2 class="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <svg class="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Flujo de Trabajo
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
          @for (step of workflowSteps; track step.title; let i = $index; let last = $last) {
            <div class="relative">
              <div class="card-base p-5 h-full animate-fadeInUp">
                <div class="flex items-center gap-3 mb-3">
                  <span class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-white shadow-sm"
                        [style.background-color]="step.color">
                    {{ i + 1 }}
                  </span>
                  <h3 class="font-semibold text-slate-800 text-sm">{{ step.title }}</h3>
                </div>
                <p class="text-xs text-gray-800 leading-relaxed">{{ step.description }}</p>
              </div>
              @if (!last) {
                <div class="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-gray-700" aria-hidden="true">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
              }
            </div>
          }
        </div>
      </div>

    </div>
    }
  `,
  styles: [`
    .hero-card {
      background: linear-gradient(135deg, #04202C 0%, #304040 40%, #021519 100%);
    }
    .card-base {
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.04);
      border-radius: 0.75rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
      position: relative;
      transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
    }
    .card-base:hover {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 8px 20px -4px rgba(4, 32, 44, 0.1);
      transform: translateY(-1px);
    }
  `],
})
export class DashboardComponent implements OnInit {
  stats: CorpusStats | null = null;
  corpusLoaded = false;
  modelTrained = false;
  apiOnline = false;
  loadingStats = true;
  loadingHealth = true;
  environment = environment;

  deliverables = [
    {
      name: 'Tabla de probabilidades de emision',
      description: 'Matriz de probabilidades P(palabra|etiqueta) calculadas a partir del corpus EAGLES.',
      available: false,
    },
    {
      name: 'Tabla de probabilidades de transicion',
      description: 'Matriz de probabilidades P(etiqueta_t|etiqueta_t-1) entre pares de etiquetas consecutivas.',
      available: false,
    },
    {
      name: 'Matriz de Viterbi - Oracion A',
      description: 'Resultado del algoritmo de Viterbi para: "Habla con el enfermo grave de trasplantes."',
      available: false,
    },
    {
      name: 'Matriz de Viterbi - Oracion B',
      description: 'Resultado del algoritmo de Viterbi para: "El enfermo grave habla de trasplantes."',
      available: false,
    },
    {
      name: 'Notebook / Codigo fuente documentado',
      description: 'Notebook Jupyter o codigo fuente con la implementacion completa del etiquetador.',
      available: false,
    },
    {
      name: 'Archivo ZIP con todos los entregables',
      description: 'Paquete comprimido con todas las tablas, matrices, notebook y documentacion.',
      available: false,
    },
  ];

  workflowSteps = [
    {
      title: 'Cargar Corpus',
      description: 'Carga los archivos del corpus EAGLES en formato XML. Se extraen tokens, oraciones y etiquetas POS.',
      color: '#04202C',
    },
    {
      title: 'Entrenar Modelo',
      description: 'Calcula las probabilidades de emision y transicion del modelo HMM a partir de los datos del corpus.',
      color: '#04202C',
    },
    {
      title: 'Etiquetar Oraciones',
      description: 'Aplica el algoritmo de Viterbi para encontrar la secuencia optima de etiquetas POS.',
      color: '#304040',
    },
    {
      title: 'Exportar Resultados',
      description: 'Descarga las tablas de probabilidades, matrices de Viterbi y notebook como entregables.',
      color: '#304040',
    },
  ];

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.checkHealth();
    this.loadCorpusStats();
  }

  private checkHealth(): void {
    this.loadingHealth = true;
    this.http.get<any>(`${environment.apiUrl}/health`).subscribe({
      next: () => {
        this.apiOnline = true;
        this.loadingHealth = false;
      },
      error: () => {
        this.apiOnline = false;
        this.loadingHealth = false;
      },
    });
  }

  private loadCorpusStats(): void {
    this.loadingStats = true;
    this.apiService.getCorpusStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.corpusLoaded = stats.is_loaded;
        this.modelTrained = stats.total_tokens > 0 && stats.unique_tags > 0;
        this.updateDeliverablesStatus();
        this.loadingStats = false;
      },
      error: () => {
        this.stats = null;
        this.corpusLoaded = false;
        this.modelTrained = false;
        this.loadingStats = false;
      },
    });
  }

  private updateDeliverablesStatus(): void {
    if (this.modelTrained) {
      this.deliverables[0].available = true;
      this.deliverables[1].available = true;
    }
    if (this.corpusLoaded && this.modelTrained) {
      this.deliverables[2].available = true;
      this.deliverables[3].available = true;
      this.deliverables[4].available = true;
      this.deliverables[5].available = true;
    }
  }
}
