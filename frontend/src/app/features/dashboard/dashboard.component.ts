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
    <!-- Hero Section -->
    <section class="relative overflow-hidden gradient-hero text-white rounded-2xl lg:rounded-3xl mx-0 mb-8">
      <!-- Decorative elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-32 -left-16 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
        <!-- Grid pattern -->
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-5 sm:px-8 py-12 md:py-16">
        <div class="text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span class="text-xs font-medium text-blue-100 tracking-wide">PLN — UNIR 2026</span>
          </div>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Etiquetador Morfosintactico
            <span class="block text-blue-200/80 text-2xl sm:text-3xl md:text-4xl font-bold mt-1">HMM + Viterbi</span>
          </h1>
          <p class="text-base sm:text-lg text-blue-100/90 max-w-3xl mx-auto mb-3 leading-relaxed">
            Modelo Oculto de Markov para el etiquetado de partes del discurso (POS Tagging)
            con el corpus EAGLES en espanol
          </p>
          <p class="text-sm text-blue-200/70 max-w-2xl mx-auto">
            Actividad de la asignatura Procesamiento del Lenguaje Natural &mdash;
            Master Universitario en Inteligencia Artificial &mdash; UNIR
          </p>
        </div>
      </div>
    </section>

    <!-- API Status Banner -->
    <div class="max-w-7xl mx-auto mb-8" role="status" aria-live="polite">
      <div class="rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border"
           [class]="loadingHealth ? 'bg-gray-50/80 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-700/50' : apiOnline ? 'bg-green-50/80 dark:bg-green-900/10 border-green-200/80 dark:border-green-800/50' : 'bg-red-50/80 dark:bg-red-900/10 border-red-200/80 dark:border-red-800/50'">
        <div class="flex items-center gap-3">
          <span class="relative flex h-3 w-3" aria-hidden="true">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  [class]="loadingHealth ? 'bg-gray-400' : apiOnline ? 'bg-green-400' : 'bg-red-400'"></span>
            <span class="relative inline-flex rounded-full h-3 w-3"
                  [class]="loadingHealth ? 'bg-gray-500' : apiOnline ? 'bg-green-500' : 'bg-red-500'"></span>
          </span>
          <span class="text-sm font-medium"
                [class]="loadingHealth ? 'text-gray-600 dark:text-gray-400' : apiOnline ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
            {{ loadingHealth ? 'Verificando conexion con la API...' : (apiOnline ? 'API conectada y funcionando correctamente' : 'No se puede conectar con la API') }}
          </span>
        </div>
        <span class="text-xs px-3 py-1 rounded-full font-mono"
              [class]="loadingHealth ? 'bg-gray-200/60 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400' : apiOnline ? 'bg-green-200/60 text-green-800 dark:bg-green-800/30 dark:text-green-300' : 'bg-red-200/60 text-red-800 dark:bg-red-800/30 dark:text-red-300'">
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
    <div class="max-w-7xl mx-auto">

      <!-- Status Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10 stagger-children">
        <!-- Corpus Status -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300 animate-slideUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Corpus</span>
            <span class="w-9 h-9 rounded-lg flex items-center justify-center"
                  [class]="corpusLoaded ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (corpusLoaded) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                }
              </svg>
            </span>
          </div>
          <p class="text-lg font-bold" [class]="corpusLoaded ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ corpusLoaded ? 'Cargado' : 'No cargado' }}
          </p>
        </div>

        <!-- Model Status -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300 animate-slideUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Modelo</span>
            <span class="w-9 h-9 rounded-lg flex items-center justify-center"
                  [class]="modelTrained ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (modelTrained) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01"/>
                }
              </svg>
            </span>
          </div>
          <p class="text-lg font-bold" [class]="modelTrained ? 'text-green-700 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'">
            {{ modelTrained ? 'Entrenado' : 'Sin entrenar' }}
          </p>
        </div>

        <!-- Total Tokens -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300 animate-slideUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tokens</span>
            <span class="w-9 h-9 rounded-lg bg-[#2F5496]/10 dark:bg-[#2F5496]/20 text-[#2F5496] dark:text-blue-300 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ stats?.total_tokens | number:'1.0-0' }}</p>
        </div>

        <!-- Total Sentences -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300 animate-slideUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Oraciones</span>
            <span class="w-9 h-9 rounded-lg bg-[#2F5496]/10 dark:bg-[#2F5496]/20 text-[#2F5496] dark:text-blue-300 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ stats?.total_sentences | number:'1.0-0' }}</p>
        </div>

        <!-- Unique Tags -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300 animate-slideUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Etiquetas</span>
            <span class="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>
              </svg>
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ stats?.unique_tags | number:'1.0-0' }}</p>
        </div>

        <!-- Unique Words -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300 animate-slideUp">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Palabras</span>
            <span class="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
              </svg>
            </span>
          </div>
          <p class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ stats?.unique_words | number:'1.0-0' }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-10">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#2F5496]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Acciones Rapidas
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <!-- Cargar Corpus -->
          <a routerLink="/corpus"
             class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300 block">
            <div class="w-12 h-12 rounded-xl bg-[#2F5496]/10 dark:bg-[#2F5496]/20 text-[#2F5496] dark:text-blue-300 flex items-center justify-center mb-4 group-hover:bg-[#2F5496] group-hover:text-white group-hover:shadow-blue transition-all duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-100 mb-1">Cargar Corpus</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Carga y procesa los archivos del corpus EAGLES para extraer tokens y etiquetas.</p>
            <span class="absolute top-5 right-5 text-gray-300 dark:text-gray-600 group-hover:text-[#2F5496] dark:group-hover:text-blue-300 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </a>

          <!-- Entrenar Modelo -->
          <a routerLink="/probabilities"
             class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300 block">
            <div class="w-12 h-12 rounded-xl bg-[#2F5496]/10 dark:bg-[#2F5496]/20 text-[#2F5496] dark:text-blue-300 flex items-center justify-center mb-4 group-hover:bg-[#2F5496] group-hover:text-white group-hover:shadow-blue transition-all duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-100 mb-1">Entrenar Modelo</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Calcula las probabilidades de emision y transicion del modelo HMM.</p>
            <span class="absolute top-5 right-5 text-gray-300 dark:text-gray-600 group-hover:text-[#2F5496] dark:group-hover:text-blue-300 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </a>

          <!-- Etiquetar Oracion -->
          <a routerLink="/viterbi"
             class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 hover:shadow-orange hover:-translate-y-0.5 transition-all duration-300 block">
            <div class="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-orange transition-all duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-100 mb-1">Etiquetar Oracion</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Aplica el algoritmo de Viterbi para etiquetar cualquier oracion en espanol.</p>
            <span class="absolute top-5 right-5 text-gray-300 dark:text-gray-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </a>

          <!-- Descargar Entregables -->
          <a routerLink="/exports"
             class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 hover:shadow-orange hover:-translate-y-0.5 transition-all duration-300 block">
            <div class="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-orange transition-all duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-100 mb-1">Descargar Entregables</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Descarga todos los archivos requeridos: tablas Excel, matrices y notebook.</p>
            <span class="absolute top-5 right-5 text-gray-300 dark:text-gray-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </a>
        </div>
      </div>

      <!-- Required Sentences Section -->
      <div class="mb-10">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
          Oraciones Requeridas por la Actividad
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Sentence 1 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300">
            <div class="flex items-start gap-3 mb-4">
              <span class="flex-shrink-0 w-9 h-9 gradient-primary text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-blue">1</span>
              <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Oracion A</span>
                <p class="text-lg font-medium text-gray-800 dark:text-gray-100 italic">
                  &laquo;Habla con el enfermo grave de trasplantes.&raquo;
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Oracion donde <strong>&laquo;habla&raquo;</strong> funciona como <em>verbo</em>
              y <strong>&laquo;grave&raquo;</strong> como <em>adjetivo</em> que modifica a &laquo;enfermo&raquo;.
            </p>
            <a routerLink="/viterbi"
               [queryParams]="{ sentence: 'Habla con el enfermo grave de trasplantes.' }"
               class="inline-flex items-center gap-2 px-4 py-2.5 gradient-primary text-white text-sm font-medium rounded-xl shadow-blue hover:shadow-blue-lg hover:-translate-y-0.5 transition-all duration-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Etiquetar con Viterbi
            </a>
          </div>

          <!-- Sentence 2 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6 hover:shadow-orange hover:-translate-y-0.5 transition-all duration-300">
            <div class="flex items-start gap-3 mb-4">
              <span class="flex-shrink-0 w-9 h-9 gradient-accent text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-orange">2</span>
              <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Oracion B</span>
                <p class="text-lg font-medium text-gray-800 dark:text-gray-100 italic">
                  &laquo;El enfermo grave habla de trasplantes.&raquo;
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Oracion donde <strong>&laquo;habla&raquo;</strong> funciona como <em>sustantivo</em>
              y <strong>&laquo;enfermo&raquo;</strong> como <em>sustantivo</em> modificado por el adjetivo &laquo;grave&raquo;.
            </p>
            <a routerLink="/viterbi"
               [queryParams]="{ sentence: 'El enfermo grave habla de trasplantes.' }"
               class="inline-flex items-center gap-2 px-4 py-2.5 gradient-accent text-white text-sm font-medium rounded-xl shadow-orange hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Etiquetar con Viterbi
            </a>
          </div>
        </div>
      </div>

      <!-- Deliverables Checklist -->
      <div class="mb-10">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#2F5496]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          Lista de Entregables de la Actividad
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden">
          <div class="divide-y divide-gray-100 dark:divide-gray-700/60">
            @for (item of deliverables; track item.name; let i = $index) {
            <div class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
              <span class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    [class]="item.available ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'">
                @if (item.available) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                } @else {
                  <span>{{ i + 1 }}</span>
                }
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ item.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.description }}</p>
              </div>
              <span class="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
                    [class]="item.available ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'">
                {{ item.available ? 'Disponible' : 'Pendiente' }}
              </span>
            </div>
          }
          </div>
        </div>
      </div>

      <!-- Workflow Steps -->
      <div class="mb-10">
        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#2F5496]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Flujo de Trabajo
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          @for (step of workflowSteps; track step.title; let i = $index; let last = $last) {
            <div class="relative">
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5 h-full hover:shadow-blue hover:-translate-y-0.5 transition-all duration-300">
                <div class="flex items-center gap-3 mb-3">
                  <span class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm"
                        [style.background-color]="step.color">
                    {{ i + 1 }}
                  </span>
                  <h3 class="font-semibold text-gray-800 dark:text-gray-100 text-sm">{{ step.title }}</h3>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ step.description }}</p>
              </div>
              @if (!last) {
                <div class="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-gray-300 dark:text-gray-600" aria-hidden="true">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
      color: '#2F5496',
    },
    {
      title: 'Entrenar Modelo',
      description: 'Calcula las probabilidades de emision y transicion del modelo HMM a partir de los datos del corpus.',
      color: '#2F5496',
    },
    {
      title: 'Etiquetar Oraciones',
      description: 'Aplica el algoritmo de Viterbi para encontrar la secuencia optima de etiquetas POS.',
      color: '#f97316',
    },
    {
      title: 'Exportar Resultados',
      description: 'Descarga las tablas de probabilidades, matrices de Viterbi y notebook como entregables.',
      color: '#f97316',
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
    this.http.get<any>(`${environment.apiUrl}/`).subscribe({
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
