import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';

@Component({
  selector: 'jc-locations',
  standalone: true,
  imports: [CommonModule, TranslatePipe, CardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-text-primary mb-6">{{ 'LOCATIONS' | translate }}</h1>
      <jc-card>
        <div class="card-body">
          <p class="text-text-muted">{{ 'LOADING' | translate }}...</p>
        </div>
      </jc-card>
    </div>
  `
})
export class LocationsComponent {}