import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

@Component({
  selector: 'jc-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <footer class="app-footer bg-primary-900 text-ivory-100" role="contentinfo">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="lg:col-span-1">
            <a routerLink="/" class="flex items-center gap-2 mb-4" aria-label="Jamaat Connect Home">
              <svg class="w-8 h-8 text-gold-400" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="16" cy="16" r="15" stroke="currentColor" stroke-width="2"/>
                <path d="M16 6v20M6 16h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="16" cy="16" r="6" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <span class="text-xl font-bold text-white">{{ 'HOME' | translate }}</span>
            </a>
            <p class="text-ivory-300 text-sm leading-relaxed">{{ 'HOME_DESCRIPTION' | translate }}</p>
          </div>

          <!-- Quick Links -->
          <nav aria-labelledby="footer-links-heading">
            <h3 id="footer-links-heading" class="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">{{ 'FOOTER_HELP' | translate }}</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/about" class="text-ivory-300 hover:text-gold-400 transition-colors">{{ 'FOOTER_ABOUT' | translate }}</a></li>
              <li><a routerLink="/guidelines" class="text-ivory-300 hover:text-gold-400 transition-colors">{{ 'FOOTER_GUIDELINES' | translate }}</a></li>
              <li><a routerLink="/help" class="text-ivory-300 hover:text-gold-400 transition-colors">{{ 'FOOTER_HELP' | translate }}</a></li>
              <li><a routerLink="/contact" class="text-ivory-300 hover:text-gold-400 transition-colors">{{ 'FOOTER_CONTACT' | translate }}</a></li>
            </ul>
          </nav>

          <!-- Legal -->
          <nav aria-labelledby="footer-legal-heading">
            <h3 id="footer-legal-heading" class="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">{{ 'FOOTER_LEGAL' | translate }}</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/privacy" class="text-ivory-300 hover:text-gold-400 transition-colors">{{ 'FOOTER_PRIVACY' | translate }}</a></li>
              <li><a routerLink="/terms" class="text-ivory-300 hover:text-gold-400 transition-colors">{{ 'FOOTER_TERMS' | translate }}</a></li>
              <li><a routerLink="/report" class="text-ivory-300 hover:text-gold-400 transition-colors">{{ 'REPORT_LISTING' | translate }}</a></li>
            </ul>
          </nav>

          <!-- Language & Social -->
          <div>
            <h3 class="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">{{ 'LANGUAGE_SWITCH' | translate }}</h3>
            <div class="flex gap-2 mb-6">
              <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-800 text-gold-400 hover:bg-primary-700 transition-colors" aria-label="Bengali">বাংলা</button>
              <button type="button" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-800 text-ivory-300 hover:bg-primary-700 transition-colors" aria-label="English">English</button>
            </div>
            <div class="flex gap-4">
              <a href="#" class="text-ivory-400 hover:text-gold-400 transition-colors" aria-label="Facebook">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" class="text-ivory-400 hover:text-gold-400 transition-colors" aria-label="Twitter">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" class="text-ivory-400 hover:text-gold-400 transition-colors" aria-label="YouTube">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div class="divider-gold my-8" aria-hidden="true"></div>

        <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ivory-400">
          <p>{{ 'COPYRIGHT' | translate }}</p>
          <div class="flex items-center gap-4">
            <span class="text-ivory-500">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
