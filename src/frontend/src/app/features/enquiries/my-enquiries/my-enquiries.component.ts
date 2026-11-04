import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ApiService, EnquiryDetailDto, PagedResult } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'jc-my-enquiries',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-text-primary">{{ 'ENQUIRIES' | translate }}</h1>
        <div class="flex gap-2">
          <select class="input w-auto" [(ngModel)]="selectedStatus" (ngModelChange)="loadEnquiries()">
            <option value="">{{ 'ALL' | translate }}</option>
            <option value="Pending">{{ 'ENQUIRY_PENDING' | translate }}</option>
            <option value="Contacted">{{ 'ENQUIRY_CONTACTED' | translate }}</option>
            <option value="Junk">{{ 'ENQUIRY_JUNK' | translate }}</option>
            <option value="Archived">{{ 'ENQUIRY_ARCHIVED' | translate }}</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
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
      } @else if (enquiries().length === 0) {
        <jc-card>
          <div class="card-body text-center py-16">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-ivory-200 flex items-center justify-center">
              <svg class="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
            <h3 class="text-lg font-medium text-text-primary mb-2">{{ 'NO_ENQUIRIES' | translate }}</h3>
            <p class="text-text-muted mb-6">{{ 'NO_ENQUIRIES_DESC' | translate }}</p>
            <jc-button variant="primary" [label]="'BROWSE_LISTINGS' | translate" (clicked)="goToSearch()" />
          </div>
        </jc-card>
      } @else {
        <div class="space-y-4">
          @for (enquiry of enquiries(); track enquiry.id) {
            <jc-card>
              <div class="card-body">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-text-primary truncate">{{ enquiry.listingTitle }}</h3>
                      <span class="badge" [class]="getStatusBadgeClass(enquiry.status)">{{ enquiry.status | translate }}</span>
                    </div>
                    <div class="space-y-2 text-sm text-text-muted">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        <span>{{ enquiry.senderName }}</span>
                      </div>
                      @if (enquiry.senderPhone) {
                        <div class="flex items-center gap-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                          <span>{{ enquiry.senderPhone }}</span>
                        </div>
                      }
                      <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span>{{ enquiry.createdAt | date:'medium' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <jc-button variant="outline" size="sm" [label]="'VIEW_LISTING' | translate" [routerLink]="['/listing', enquiry.listingId]" />
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-ivory-200">
                  <p class="text-sm text-text-muted">{{ 'MESSAGE' | translate }}:</p>
                  <p class="text-text-primary whitespace-pre-wrap mt-1">{{ enquiry.message }}</p>
                </div>
              </div>
            </jc-card>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-2 mt-8">
            <jc-button variant="outline" size="sm" [label]="'PREVIOUS' | translate" [disabled]="!hasPreviousPage()" (clicked)="prevPage()" />
            <span class="text-sm text-text-muted">{{ 'PAGE' | translate }} {{ currentPage() }} {{ 'OF' | translate }} {{ totalPages() }}</span>
            <jc-button variant="outline" size="sm" [label]="'NEXT' | translate" [disabled]="!hasNextPage()" (clicked)="nextPage()" />
          </div>
        }
      }
    </div>
  `
})
export class MyEnquiriesComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  auth = inject(AuthService);

  enquiries = signal<EnquiryDetailDto[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = 12;
  totalPages = signal(0);
  totalCount = signal(0);
  selectedStatus = signal<string>('');

  ngOnInit(): void {
    this.loadEnquiries();
  }

  loadEnquiries(): void {
    this.loading.set(true);
    this.api.getMyEnquiries({
      page: this.currentPage(),
      pageSize: this.pageSize,
      status: this.selectedStatus() || undefined
    }).subscribe({
      next: (result: PagedResult<EnquiryDetailDto>) => {
        this.enquiries.set(result.items);
        this.totalPages.set(result.totalPages);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load enquiries', err);
        this.loading.set(false);
      }
    });
  }

  hasPreviousPage(): boolean {
    return this.currentPage() > 1;
  }

  hasNextPage(): boolean {
    return this.currentPage() < this.totalPages();
  }

  prevPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(p => p - 1);
      this.loadEnquiries();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
      this.loadEnquiries();
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Contacted': return 'badge-success';
      case 'Junk': return 'badge-error';
      case 'Archived': return 'badge-info';
      default: return 'badge-info';
    }
  }

  goToSearch(): void {
    this.router.navigate(['/search']);
  }
}