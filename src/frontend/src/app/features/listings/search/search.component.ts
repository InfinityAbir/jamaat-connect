import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { LanguageService } from '@app/core/services/language.service';
import { ApiService, LocationDto, PagedResult, ListingSummaryDto } from '@app/core/services/api.service';

@Component({
  selector: 'jc-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-text-primary mb-2">{{ 'SEARCH_RESULTS' | translate }}</h1>
        <p class="text-text-muted">{{ 'SEARCH_PLACEHOLDER' | translate }}</p>
      </div>

      <!-- Filters Sidebar (Mobile: collapsible) -->
      <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <aside class="lg:col-span-3">
          <div class="sticky top-24 space-y-6">
            <div>
              <h3 class="text-lg font-semibold text-text-primary mb-4">{{ 'FILTERS' | translate }}</h3>
              
              <!-- Location Filter -->
              <div class="mb-4">
                <label class="label">{{ 'FILTER_LOCATION' | translate }}</label>
                <select 
                  class="input" 
                  [(ngModel)]="selectedLocationId" 
                  (ngModelChange)="onLocationChange()"
                >
                  <option value="">{{ 'FILTER_LOCATION' | translate }}</option>
                  @for (loc of topLevelLocations(); track loc.id) {
                    <option [value]="loc.id">{{ loc.name }}</option>
                  }
                </select>
              </div>

              <!-- Sub-location Filter (when parent selected) -->
              @if (selectedLocationId() && subLocations().length > 0) {
                <div class="mb-4">
                  <label class="label">{{ 'FILTER_LOCATION' | translate }} (Sub)</label>
                  <select 
                    class="input" 
                    [(ngModel)]="selectedSubLocationId" 
                    (ngModelChange)="onSubLocationChange()"
                  >
                    <option value="">{{ 'ALL' | translate }}</option>
                    @for (loc of subLocations(); track loc.id) {
                      <option [value]="loc.id">{{ loc.name }}</option>
                    }
                  </select>
                </div>
              }

              <!-- Date Range -->
              <div class="mb-4">
                <label class="label">{{ 'FILTER_DATE_FROM' | translate }}</label>
                <input type="date" class="input" [(ngModel)]="departureDateFrom" (ngModelChange)="onFiltersChange()" />
              </div>
              <div class="mb-4">
                <label class="label">{{ 'FILTER_DATE_TO' | translate }}</label>
                <input type="date" class="input" [(ngModel)]="departureDateTo" (ngModelChange)="onFiltersChange()" />
              </div>

              <!-- Duration -->
              <div class="mb-4">
                <label class="label">{{ 'FILTER_DURATION' | translate }}</label>
                <select class="input" [(ngModel)]="durationDays" (ngModelChange)="onFiltersChange()">
                  <option value="">{{ 'ALL' | translate }}</option>
                  @for (d of durations(); track d) {
                    <option [value]="d">{{ d }} {{ 'DAYS' | translate }}</option>
                  }
                </select>
              </div>

              <!-- Availability -->
              <div class="mb-4">
                <label class="label">{{ 'FILTER_AVAILABILITY' | translate }}</label>
                <select class="input" [(ngModel)]="availabilityStatus" (ngModelChange)="onFiltersChange()">
                  <option value="">{{ 'ALL' | translate }}</option>
                  <option value="Available">{{ 'AVAILABILITY_AVAILABLE' | translate }}</option>
                  <option value="Limited">{{ 'AVAILABILITY_LIMITED' | translate }}</option>
                  <option value="Full">{{ 'AVAILABILITY_FULL' | translate }}</option>
                </select>
              </div>

              <!-- Sort -->
              <div class="mb-4">
                <label class="label">{{ 'SORT_BY' | translate }}</label>
                <select class="input" [(ngModel)]="sortBy" (ngModelChange)="onFiltersChange()">
                  <option value="departureAt">{{ 'SORT_DATE_ASC' | translate }}</option>
                  <option value="-departureAt">{{ 'SORT_DATE_DESC' | translate }}</option>
                  <option value="-createdAt">{{ 'SORT_NEWEST' | translate }}</option>
                </select>
              </div>

              <!-- Clear Filters -->
              <jc-button 
                variant="outline" 
                [fullWidth]="true" 
                [label]="'CLEAR_FILTERS' | translate" 
                (clicked)="clearFilters()" 
              />
            </div>
          </div>
        </aside>

        <!-- Results -->
        <main class="lg:col-span-9">
          <!-- Results Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              @if (results()) {
                <p class="text-text-muted">
                  {{ results()!.totalCount }} {{ results()!.totalCount === 1 ? ('RESULT' | translate) : ('RESULTS' | translate) }}
                </p>
              } @else {
                <p class="text-text-muted">{{ 'LOADING' | translate }}...</p>
              }
            </div>
          </div>

          <!-- Loading State -->
          @if (loading()) {
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="card animate-pulse">
                  <div class="card-body">
                    <div class="skeleton h-8 w-3/4 mb-4"></div>
                    <div class="skeleton h-4 w-full mb-2"></div>
                    <div class="skeleton h-4 w-2/3 mb-4"></div>
                    <div class="skeleton h-6 w-24"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (results() && results()!.items.length === 0) {
            <!-- Empty State -->
            <div class="text-center py-16">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-ivory-200 flex items-center justify-center">
                <svg class="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-text-primary mb-2">{{ 'NO_RESULTS' | translate }}</h3>
              <p class="text-text-muted mb-6">{{ 'NO_RESULTS_DESC' | translate }}</p>
              <jc-button variant="outline" [label]="'CLEAR_FILTERS' | translate" (clicked)="clearFilters()" />
            </div>
          } @else {
            <!-- Results Grid -->
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              @for (listing of results()!.items; track listing.id) {
                <jc-card [customClass]="'h-full'">
                  <div class="card-body">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-text-primary flex-1">{{ listing.title }}</h3>
                      <span class="badge badge-info">{{ listing.verificationStatus }}</span>
                    </div>
                    
                    <div class="space-y-2 text-sm text-text-muted mb-4">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span>{{ listing.departureLocationName }}</span>
                      </div>
                      @if (listing.departureAt) {
                        <div class="flex items-center gap-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          <span>{{ listing.departureAt | date:'mediumDate' }}</span>
                        </div>
                      }
                      @if (listing.durationDays) {
                        <div class="flex items-center gap-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span>{{ listing.durationDays }} {{ 'DAYS' | translate }}</span>
                        </div>
                      }
                    </div>

                    <div class="flex items-center justify-between pt-4 border-t border-ivory-200">
                      <span class="badge" [class.badge-success]="listing.availabilityStatus === 'Available'" [class.badge-warning]="listing.availabilityStatus === 'Limited'" [class.badge-error]="listing.availabilityStatus === 'Full'">
                        {{ listing.availabilityStatus }}
                      </span>
                      <jc-button
                        [routerLink]="['/listing', listing.id]"
                        variant="outline"
                        size="sm"
                        [label]="'LISTING_DETAILS' | translate"
                      >
                      </jc-button>
                    </div>
                  </div>
                </jc-card>
              }
            </div>

            <!-- Pagination -->
            @if (results() && results()!.totalPages > 1) {
              <div class="flex items-center justify-center gap-2 mt-8">
                <jc-button 
                  variant="outline" 
                  size="sm" 
                  [label]="'PREVIOUS' | translate" 
                  [disabled]="!results()!.hasPreviousPage"
                  (clicked)="previousPage()"
                />
                <span class="text-sm text-text-muted">
                  {{ 'PAGE' | translate }} {{ currentPage() }} {{ 'OF' | translate }} {{ results()?.totalPages }}
                </span>
                <jc-button 
                  variant="outline" 
                  size="sm" 
                  [label]="'NEXT' | translate" 
                  [disabled]="!results()!.hasNextPage"
                  (clicked)="nextPage()"
                />
              </div>
            }
          }
        </main>
      </div>
    </div>
  `
})
export class SearchComponent implements OnInit {
  private api = inject(ApiService);
  private lang = inject(LanguageService);

  // State
  topLevelLocations = signal<LocationDto[]>([]);
  subLocations = signal<LocationDto[]>([]);
  results = signal<PagedResult<ListingSummaryDto> | null>(null);
  loading = signal(false);

  // Filters
  selectedLocationId = signal<string>('');
  selectedSubLocationId = signal<string>('');
  departureDateFrom = signal<string>('');
  departureDateTo = signal<string>('');
  durationDays = signal<number | null>(null);
  availabilityStatus = signal<string>('');
  sortBy = signal<string>('departureAt');

  currentPage = signal(1);

  // Computed
  durations = signal([1, 2, 3, 4, 5, 7, 10, 14, 21, 30, 40]);

  ngOnInit(): void {
    this.loadTopLevelLocations();
    this.loadListings();
  }

  loadTopLevelLocations(): void {
    this.api.getBangladeshDivisions().subscribe({
      next: (locations: LocationDto[]) => this.topLevelLocations.set(locations),
      error: (err: Error) => console.error('Failed to load locations', err)
    });
  }

  onLocationChange(): void {
    const parentId = this.selectedLocationId();
    this.selectedSubLocationId.set('');
    
    if (parentId) {
      this.api.getLocations(parentId).subscribe({
        next: (locations: LocationDto[]) => this.subLocations.set(locations),
        error: (err: Error) => console.error('Failed to load sub-locations', err)
      });
    } else {
      this.subLocations.set([]);
    }
    this.loadListings();
  }

  onSubLocationChange(): void {
    this.loadListings();
  }

  onFiltersChange(): void {
    this.currentPage.set(1);
    this.loadListings();
  }

  clearFilters(): void {
    this.selectedLocationId.set('');
    this.selectedSubLocationId.set('');
    this.departureDateFrom.set('');
    this.departureDateTo.set('');
    this.durationDays.set(null);
    this.availabilityStatus.set('');
    this.sortBy.set('departureAt');
    this.currentPage.set(1);
    this.loadListings();
  }

  previousPage(): void {
    if (this.results()?.hasPreviousPage) {
      this.currentPage.update(p => p - 1);
      this.loadListings();
    }
  }

  nextPage(): void {
    if (this.results()?.hasNextPage) {
      this.currentPage.update(p => p + 1);
      this.loadListings();
    }
  }

  loadListings(): void {
    this.loading.set(true);
    
    const params = {
      page: this.currentPage(),
      pageSize: 12,
      locationId: this.selectedSubLocationId() || this.selectedLocationId() || undefined,
      departureDateFrom: this.departureDateFrom() || undefined,
      departureDateTo: this.departureDateTo() || undefined,
      durationDays: this.durationDays() || undefined,
      availabilityStatus: this.availabilityStatus() || undefined,
      sortBy: this.sortBy().replace('-', ''),
      sortDirection: this.sortBy().startsWith('-') ? 'desc' : 'asc'
    };

    this.api.searchListings(params).subscribe({
      next: (results: PagedResult<ListingSummaryDto>) => {
        this.results.set(results);
        this.loading.set(false);
      },
      error: (err: Error) => {
        console.error('Failed to load listings', err);
        this.loading.set(false);
      }
    });
  }
}
