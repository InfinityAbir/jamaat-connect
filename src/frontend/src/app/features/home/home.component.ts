import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { LanguageService } from '@app/core/services/language.service';
import { Router } from '@angular/router';

@Component({
  selector: 'jc-home',
  standalone: true,
  imports: [TranslatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="min-h-screen site-home">
      <!-- Hero Section -->
      <section class="home-hero relative overflow-hidden bg-gradient-to-b from-primary-50 via-ivory-50 to-white" aria-labelledby="hero-title">
        <div class="pattern-overlay" aria-hidden="true"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
          <div class="home-hero__content text-center max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-6">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              {{ 'WELCOME' | translate }} {{ lang.currentLang() === 'bn' ? 'জামাআত কানেক্ট-এ' : 'to Jamaat Connect' }}
            </div>

            <h1 id="hero-title" class="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6 text-balance">
              {{ 'HOME' | translate }}
            </h1>

            <p class="text-lg sm:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              {{ 'HOME_DESCRIPTION' | translate }}
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <jc-button variant="primary" size="lg" [label]="'SEARCH' | translate" [icon]="searchIcon" (clicked)="goToSearch()" />
              <jc-button variant="secondary" size="lg" [label]="'SUBMIT_LISTING' | translate" [icon]="submitIcon" (clicked)="goToSubmit()" />
            </div>

            <!-- Trust indicators -->
            <div class="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                {{ 'VERIFIED' | translate }} {{ 'LISTINGS' | translate }}
              </span>
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                {{ 'PRIVATE' | translate }} {{ 'ENQUIRIES' | translate }}
              </span>
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-gold-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                {{ 'MODERATED' | translate }} {{ 'CONTENT' | translate }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="home-features py-16 sm:py-24 bg-surface" aria-labelledby="features-title">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="home-section-heading text-center mb-16">
            <h2 id="features-title" class="text-3xl sm:text-4xl font-bold text-text-primary mb-4">{{ 'HOW_IT_WORKS' | translate }}</h2>
            <p class="text-lg text-text-muted max-w-2xl mx-auto">{{ 'HOW_IT_WORKS_DESC' | translate }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (feature of features; track feature.id) {
              <jc-card class="feature-card" [customClass]="'h-full'" [hasHeader]="true">
                <div slot="header" class="flex items-center gap-3">
                  <div class="feature-icon" aria-hidden="true">
                    @switch (feature.id) {
                      @case ('discover') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="11" cy="11" r="5.5"></circle><path d="m16 16 4 4M11 8.5v5M8.5 11h5"></path></svg>
                      }
                      @case ('submit') {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6M12 17v-6m-3 3h6"></path></svg>
                      }
                      @default {
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="10" r="2.2"></circle><path d="M3.5 20c.5-3.2 2.5-5 5.5-5s5 1.8 5.5 5M14.5 20c.3-2.2 1.7-3.6 4-3.6 1.1 0 1.8.3 2.5.8"></path></svg>
                      }
                    }
                  </div>
                  <h3 class="text-lg font-semibold text-text-primary">{{ feature.title | translate }}</h3>
                </div>
                <p class="text-text-muted">{{ feature.desc | translate }}</p>
              </jc-card>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="home-cta py-16 sm:py-24 bg-primary-900 relative" aria-labelledby="cta-title">
        <div class="pattern-overlay" aria-hidden="true"></div>
        <div class="divider-gold mx-auto max-w-7xl" aria-hidden="true"></div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div class="text-center max-w-2xl mx-auto">
            <h2 id="cta-title" class="text-3xl sm:text-4xl font-bold text-white mb-4">{{ 'READY_TO_START' | translate }}</h2>
            <p class="text-ivory-300 mb-8">{{ 'READY_TO_START_DESC' | translate }}</p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <jc-button variant="secondary" size="lg" [label]="'SUBMIT_LISTING' | translate" [icon]="submitIcon" (clicked)="goToSubmit()" />
              <button type="button" class="cta-browse-button" (click)="goToSearch()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="5.5"></circle><path d="m16 16 4 4"></path></svg>
                <span>{{ 'BROWSE_LISTINGS' | translate }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HomeComponent {
  lang = inject(LanguageService);
  private router = inject(Router);

  searchIcon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>';
  submitIcon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>';

  features = [
    {
      id: 'discover',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
      title: 'DISCOVER',
      desc: 'DISCOVER_DESC'
    },
    {
      id: 'submit',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>',
      title: 'SUBMIT',
      desc: 'SUBMIT_DESC'
    },
    {
      id: 'connect',
      icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
      title: 'CONNECT',
      desc: 'CONNECT_DESC'
    }
  ];

  goToSearch(): void {
    this.router.navigate(['/search']);
  }

  goToSubmit(): void {
    this.router.navigate(['/submit']);
  }
}
