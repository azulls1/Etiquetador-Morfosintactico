import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'corpus',
    loadComponent: () => import('./features/corpus/corpus.component').then(m => m.CorpusComponent),
  },
  {
    path: 'probabilities',
    loadComponent: () => import('./features/probabilities/probabilities.component').then(m => m.ProbabilitiesComponent),
  },
  {
    path: 'viterbi',
    loadComponent: () => import('./features/viterbi/viterbi.component').then(m => m.ViterbiComponent),
  },
  {
    path: 'analysis',
    loadComponent: () => import('./features/analysis/analysis.component').then(m => m.AnalysisComponent),
  },
  {
    path: 'eagles',
    loadComponent: () => import('./features/analysis/eagles-reference.component').then(m => m.EaglesReferenceComponent),
  },
  {
    path: 'exports',
    loadComponent: () => import('./features/exports/exports.component').then(m => m.ExportsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
