import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';

export type Language = 'bn' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translations = signal<Record<string, string>>({});
  private _currentLang = signal<Language>('bn');

  readonly currentLang = this._currentLang.asReadonly();
  readonly isRtl = computed(() => false); // Bengali is LTR

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.init();
  }

  private init(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('language') as Language | null;
      if (saved === 'bn' || saved === 'en') {
        this._currentLang.set(saved);
      }
      document.documentElement.lang = this._currentLang();
    }
    this.loadTranslations(this._currentLang());
  }

  loadTranslations(lang: Language): void {
    this.http.get<Record<string, string>>(`/assets/i18n/${lang}.json`)
      .pipe(tap(t => this.translations.set(t)))
      .subscribe({
        error: () => {
          // Fallback to English if Bengali fails
          if (lang !== 'en') {
            this.loadTranslations('en');
          }
        }
      });
  }

  setLanguage(lang: Language): void {
    this._currentLang.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
    }
    this.loadTranslations(lang);
  }

  toggleLanguage(): void {
    this.setLanguage(this._currentLang() === 'bn' ? 'en' : 'bn');
  }

  translate(key: string, params?: Record<string, string | number>): string {
    let text = this.translations()[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      });
    }

    return text;
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }
}