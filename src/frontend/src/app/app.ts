import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <jc-header />
      <main class="flex-1" role="main">
        <router-outlet />
      </main>
      <jc-footer />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class App {
  constructor(private lang: LanguageService) {
    // Initialize language on app start
    const saved = localStorage.getItem('language') as 'bn' | 'en' | null;
    if (saved) {
      lang.setLanguage(saved);
    }
    document.documentElement.lang = lang.currentLang();
  }
}