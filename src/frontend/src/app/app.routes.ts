import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'HOME'
  },
  {
    path: 'search',
    loadComponent: () => import('./features/listings/search/search.component').then(m => m.SearchComponent),
    title: 'SEARCH_RESULTS'
  },
  {
    path: 'listing/:id',
    loadComponent: () => import('./features/listings/detail/detail.component').then(m => m.DetailComponent),
    title: 'LISTING_DETAILS'
  },
  {
    path: 'submit',
    loadComponent: () => import('./features/listings/submit/submit.component').then(m => m.SubmitComponent),
    title: 'SUBMIT_LISTING_TITLE',
    canActivate: [authGuard]
  },
  {
    path: 'my/submissions',
    loadComponent: () => import('./features/organizer/submissions/submissions.component').then(m => m.SubmissionsComponent),
    title: 'SUBMISSIONS',
    canActivate: [authGuard]
  },
  {
    path: 'my/enquiries',
    loadComponent: () => import('./features/enquiries/my-enquiries/my-enquiries.component').then(m => m.MyEnquiriesComponent),
    title: 'ENQUIRIES',
    canActivate: [authGuard]
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'LOGIN'
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'REGISTER'
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Reset password'
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
    title: 'Verify email'
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Profile',
    canActivate: [authGuard]
  },
  {
    path: 'moderation',
    loadComponent: () => import('./features/moderation/queue/queue.component').then(m => m.QueueComponent),
    title: 'MODERATION_QUEUE',
    canActivate: [authGuard, roleGuard(['Moderator', 'Administrator'])]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'ADMIN',
    canActivate: [authGuard, roleGuard(['Administrator'])],
    children: [
      { path: 'locations', loadComponent: () => import('./features/admin/locations/locations.component').then(m => m.LocationsComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent) },
      { path: '', redirectTo: 'locations', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
