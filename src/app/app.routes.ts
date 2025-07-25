import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'products',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './features/products/product-list/product-list.component'
          ).then((m) => m.ProductListComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            './features/products/product-form/product-form.component'
          ).then((m) => m.ProductFormComponent),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import(
            './features/products/product-form/product-form.component'
          ).then((m) => m.ProductFormComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            './features/products/product-detail/product-detail.component'
          ).then((m) => m.ProductDetailComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
