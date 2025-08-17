import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'mood-log',
    loadComponent: () => import('./pages/mood-log/mood-log.page').then( m => m.MoodLogPage)
  },
  {
    path: 'crisis-plan-result',
    loadComponent: () => import('./pages/crisis-plan-result/crisis-plan-result.page').then( m => m.CrisisPlanResultPage)
  },
  {
    path: 'mood-log-history',
    loadComponent: () => import('./pages/mood-log-history/mood-log-history.page').then( m => m.MoodLogHistoryPage)
  },
];
