import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

/** Number of sections per static page. Text lives in the i18n files as PAGE_<NAME>_S<n>_H / _P. */
const SECTION_COUNTS: Record<string, number> = {
  about: 3,
  guidelines: 5,
  help: 4,
  contact: 2,
  privacy: 7,
  terms: 6,
  report: 3
};

@Component({
  selector: 'jc-static-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <a routerLink="/" class="text-sm text-primary-700 hover:underline">← {{ 'PAGE_BACK_HOME' | translate }}</a>

      <h1 class="text-3xl sm:text-4xl font-bold text-text-primary mt-4 mb-3">{{ prefix() + '_TITLE' | translate }}</h1>
      <p class="text-lg text-text-muted mb-2">{{ prefix() + '_INTRO' | translate }}</p>
      @if (showDate()) {
        <p class="text-sm text-text-muted mb-8">{{ 'PAGE_LAST_UPDATED' | translate }}</p>
      }

      <div class="space-y-8 mt-8">
        @for (n of sections(); track n) {
          <section>
            <h2 class="text-xl font-semibold text-text-primary mb-2">{{ prefix() + '_S' + n + '_H' | translate }}</h2>
            <p class="text-text-muted leading-relaxed">{{ prefix() + '_S' + n + '_P' | translate }}</p>
          </section>
        }
      </div>
    </main>
  `
})
export class StaticPageComponent {
  private route = inject(ActivatedRoute);

  private page = toSignal(
    this.route.data.pipe(map(d => (d['page'] as string) ?? 'about')),
    { initialValue: 'about' }
  );

  prefix = computed(() => 'PAGE_' + this.page().toUpperCase());
  sections = computed(() => Array.from({ length: SECTION_COUNTS[this.page()] ?? 0 }, (_, i) => i + 1));
  showDate = computed(() => this.page() === 'privacy' || this.page() === 'terms');
}
