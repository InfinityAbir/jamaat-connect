import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { LanguageService } from '@app/core/services/language.service';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { ButtonComponent } from '@app/shared/components/button/button.component';

@Component({
  selector: 'jc-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ButtonComponent],
  template: `
    <header class="app-header sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-ivory-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo / Brand -->
          <button class="brand-mark flex items-center gap-2" (click)="goHome()" aria-label="Jamaat Connect Home">
            <svg class="w-8 h-8 text-primary-700" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="16" cy="16" r="15" stroke="currentColor" stroke-width="2"/>
              <path d="M16 6v20M6 16h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="16" cy="16" r="6" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span class="text-xl font-bold text-primary-900 hidden sm:block">{{ 'HOME' | translate }}</span>
          </button>

          <!-- Desktop Navigation -->
          <nav class="nav-links hidden md:flex items-center gap-6" aria-label="Main navigation">
            <button class="text-sm font-medium text-text-muted hover:text-primary-700 transition-colors" (click)="goSearch()">{{ 'SEARCH' | translate }}</button>
            <button class="text-sm font-medium text-text-muted hover:text-primary-700 transition-colors" (click)="goSubmit()">{{ 'SUBMIT_LISTING' | translate }}</button>

            @if (auth.isAuthenticated()) {
              <button class="text-sm font-medium text-text-muted hover:text-primary-700 transition-colors" (click)="goMySubmissions()">{{ 'MY_JAMAAT' | translate }}</button>
              @if (auth.isModerator()) {
                <button class="text-sm font-medium text-text-muted hover:text-primary-700 transition-colors" (click)="goModeration()">{{ 'MODERATION' | translate }}</button>
              }
              @if (auth.isAdmin()) {
                <button class="text-sm font-medium text-text-muted hover:text-primary-700 transition-colors" (click)="goAdmin()">{{ 'ADMIN' | translate }}</button>
              }
            }
          </nav>

          <!-- Right side actions -->
          <div class="flex items-center gap-3">
            <!-- Language Switcher -->
            <jc-button
              variant="ghost"
              size="sm"
              [label]="'LANGUAGE_SWITCH' | translate"
              (clicked)="onLanguageToggle()"
              [icon]="globeIcon"
            />

            @if (!auth.isAuthenticated()) {
              <jc-button variant="ghost" size="sm" [label]="'LOGIN' | translate" (clicked)="goLogin()" />
              <jc-button variant="primary" size="sm" [label]="'REGISTER' | translate" (clicked)="goRegister()" />
            } @else {
              <div class="relative" #userMenu>
                <button
                  type="button"
                  class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-primary hover:bg-ivory-100 transition-colors"
                  (click)="toggleUserMenu()"
                  aria-expanded="userMenuOpen()"
                  aria-haspopup="true"
                >
                  <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {{ auth.user()?.displayName?.charAt(0)?.toUpperCase() || 'U' }}
                  </div>
                  <span class="hidden sm:block">{{ auth.user()?.displayName }}</span>
                  <svg class="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>

                @if (userMenuOpen()) {
                  <div class="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-ivory-200 py-2 animate-in fade-in-0 zoom-in-95" role="menu">
                    <div class="px-4 py-2 border-b border-ivory-200">
                      <p class="text-sm font-medium text-text-primary">{{ auth.user()?.displayName }}</p>
                      <p class="text-xs text-text-muted truncate">{{ auth.user()?.email }}</p>
                    </div>
                    <button class="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-ivory-50" role="menuitem" (click)="goMySubmissions(); userMenuOpen.set(false)">{{ 'SUBMISSIONS' | translate }}</button>
                    <button class="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-ivory-50" role="menuitem" (click)="goMyEnquiries(); userMenuOpen.set(false)">{{ 'ENQUIRIES' | translate }}</button>
                    <button class="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-ivory-50" role="menuitem" (click)="goProfile(); userMenuOpen.set(false)">{{ 'PROFILE' | translate }}</button>
                    <hr class="my-2 border-ivory-200" />
                    <button type="button" class="w-full text-left px-4 py-2 text-sm text-error hover:bg-ivory-50" role="menuitem" (click)="onLogout()">{{ 'LOGOUT' | translate }}</button>
                  </div>
                }
              </div>
            }

            <!-- Mobile menu button -->
            <button
              type="button"
              class="md:hidden p-2 rounded-xl text-text-primary hover:bg-ivory-100"
              (click)="toggleMobileMenu()"
              aria-expanded="mobileMenuOpen()"
              aria-label="Toggle menu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" [attr.stroke-width]="mobileMenuOpen() ? 3 : 2">
                @if (!mobileMenuOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                }
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden py-4 border-t border-ivory-200 animate-in slide-in-from-top-2">
            <nav class="flex flex-col gap-2" aria-label="Mobile navigation">
              <button class="px-3 py-2 rounded-xl text-sm font-medium text-text-primary hover:bg-ivory-100 transition-colors" (click)="goSearch(); mobileMenuOpen.set(false)">{{ 'SEARCH' | translate }}</button>
              <button class="px-3 py-2 rounded-xl text-sm font-medium text-text-primary hover:bg-ivory-100 transition-colors" (click)="goSubmit(); mobileMenuOpen.set(false)">{{ 'SUBMIT_LISTING' | translate }}</button>
              @if (auth.isAuthenticated()) {
                <button class="px-3 py-2 rounded-xl text-sm font-medium text-text-primary hover:bg-ivory-100 transition-colors" (click)="goMySubmissions(); mobileMenuOpen.set(false)">{{ 'MY_JAMAAT' | translate }}</button>
                @if (auth.isModerator()) {
                  <button class="px-3 py-2 rounded-xl text-sm font-medium text-text-primary hover:bg-ivory-100 transition-colors" (click)="goModeration(); mobileMenuOpen.set(false)">{{ 'MODERATION' | translate }}</button>
                }
                @if (auth.isAdmin()) {
                  <button class="px-3 py-2 rounded-xl text-sm font-medium text-text-primary hover:bg-ivory-100 transition-colors" (click)="goAdmin(); mobileMenuOpen.set(false)">{{ 'ADMIN' | translate }}</button>
                }
              } @else {
                <button class="px-3 py-2 rounded-xl text-sm font-medium text-text-primary hover:bg-ivory-100" (click)="goLogin(); mobileMenuOpen.set(false)">{{ 'LOGIN' | translate }}</button>
                <jc-button variant="primary" [fullWidth]="true" [label]="'REGISTER' | translate" (clicked)="goRegister(); mobileMenuOpen.set(false)" />
              }
            </nav>
          </div>
        }
      </div>
    </header>
  `
})
export class HeaderComponent {
  auth = inject(AuthService);
  private lang = inject(LanguageService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  userMenuOpen = signal(false);
  
  globeIcon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>';

  onLanguageToggle(): void {
    this.lang.toggleLanguage();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  onLogout(): void {
    this.auth.logout();
    this.userMenuOpen.set(false);
  }

  goHome(): void { this.router.navigate(['/']); }
  goSearch(): void { this.router.navigate(['/search']); }
  goSubmit(): void { this.router.navigate(['/submit']); }
  goMySubmissions(): void { this.router.navigate(['/my/submissions']); }
  goMyEnquiries(): void { this.router.navigate(['/my/enquiries']); }
  goProfile(): void { this.router.navigate(['/profile']); }
  goModeration(): void { this.router.navigate(['/moderation']); }
  goAdmin(): void { this.router.navigate(['/admin']); }
  goLogin(): void { this.router.navigate(['/auth/login']); }
  goRegister(): void { this.router.navigate(['/auth/register']); }
}
