import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ApiService, ModerationQueueItemDto, PagedResult } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'jc-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-text-primary">{{ 'MODERATION_QUEUE' | translate }}</h1>
      </div>

      <!-- Tabs -->
      <div class="border-b border-ivory-200 mb-6">
        <nav class="flex gap-8" aria-label="Moderation tabs">
          @for (tab of tabs; track tab.id) {
            <button
              class="py-3 px-1 border-b-2 font-medium text-sm transition-colors"
              [class]="activeTab() === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-text-muted hover:text-text-primary'"
              (click)="setActiveTab(tab.id)"
            >
              {{ tab.label | translate }}
              @if (tab.count !== undefined) {
                <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-ivory-200 text-text-muted" [class]="activeTab() === tab.id ? 'bg-primary-100 text-primary-600' : ''">
                  {{ tab.count }}
                </span>
              }
            </button>
          }
        </nav>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4,5]; track i) {
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
      } @else if (queueItems().length === 0) {
        <jc-card>
          <div class="card-body text-center py-16">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-ivory-200 flex items-center justify-center">
              <svg class="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-lg font-medium text-text-primary mb-2">{{ 'NO_PENDING_LISTINGS' | translate }}</h3>
            <p class="text-text-muted">{{ 'NO_PENDING_LISTINGS_DESC' | translate }}</p>
          </div>
        </jc-card>
      } @else {
        <div class="space-y-4">
          @for (item of queueItems(); track item.id) {
            <jc-card [customClass]="'border-l-4 ' + getStatusBorderClass(item.publicationStatus)">
              <div class="card-body">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-text-primary truncate">{{ item.title }}</h3>
                      <span class="badge" [class]="getStatusBadgeClass(item.publicationStatus)">{{ item.publicationStatus | translate }}</span>
                    </div>
                    <div class="space-y-1 text-sm text-text-muted">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                        <span>{{ item.departureLocationName }}</span>
                      </div>
                      @if (item.departureAt) {
                        <div class="flex items-center gap-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          <span>{{ item.departureAt | date:'mediumDate' }}</span>
                        </div>
                      }
                      @if (item.durationDays) {
                        <div class="flex items-center gap-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span>{{ item.durationDays }} {{ 'DAYS' | translate }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <jc-button variant="outline" size="sm" [label]="'VIEW_DETAILS' | translate" [routerLink]="['/listing', item.id]" />
                    <jc-button variant="primary" size="sm" [label]="'REVIEW' | translate" (clicked)="openReviewModal(item)" />
                  </div>
                </div>

                <!-- Private Info (expandable) -->
                <details class="mt-4 pt-4 border-t border-ivory-200">
                  <summary class="cursor-pointer text-sm font-medium text-text-primary flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    {{ 'VIEW_PRIVATE_INFO' | translate }}
                  </summary>
                  <div class="mt-3 grid gap-2 md:grid-cols-2 text-sm">
                    <div>
                      <p class="text-text-muted">{{ 'SUBMITTER_NAME' | translate }}</p>
                      <p class="font-medium text-text-primary">{{ item.submitterName }}</p>
                    </div>
                    <div>
                      <p class="text-text-muted">{{ 'SUBMITTER_PHONE' | translate }}</p>
                      <p class="font-medium text-text-primary">{{ item.submitterPhone }}</p>
                    </div>
                    @if (item.submitterEmail) {
                      <div>
                        <p class="text-text-muted">{{ 'SUBMITTER_EMAIL' | translate }}</p>
                        <p class="font-medium text-text-primary">{{ item.submitterEmail }}</p>
                      </div>
                    }
                    @if (item.whatsAppNumber) {
                      <div>
                        <p class="text-text-muted">{{ 'WHATSAPP_NUMBER' | translate }}</p>
                        <p class="font-medium text-text-primary">{{ item.whatsAppNumber }}</p>
                      </div>
                    }
                    <div>
                      <p class="text-text-muted">{{ 'PREFERRED_CONTACT' | translate }}</p>
                      <p class="font-medium text-text-primary">{{ item.preferredContactMethod }}</p>
                    </div>
                    @if (isOwnSubmission(item.submitterUserId)) {
                      <div class="col-span-2">
                        <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p class="text-sm text-amber-800">{{ 'CANNOT_APPROVE_OWN' | translate }}</p>
                        </div>
                      </div>
                    }
                  </div>
                </details>
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

    <!-- Review Modal -->
    @if (reviewItem()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="review-title">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" (click)="closeReviewModal()"></div>
          <jc-card class="w-full max-w-2xl relative" [customClass]="'shadow-xl max-h-[90vh] overflow-y-auto'">
            <div class="card-header sticky top-0 bg-surface z-10">
              <h2 id="review-title" class="text-xl font-bold text-text-primary">{{ 'REVIEW_LISTING' | translate }}</h2>
              <button type="button" class="absolute right-4 top-4 text-text-muted hover:text-text-primary" (click)="closeReviewModal()">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="card-body space-y-4">
              <h3 class="text-lg font-semibold text-text-primary">{{ reviewItem()!.title }}</h3>
              <p class="text-sm text-text-muted">{{ reviewItem()!.departureLocationName }} &middot; {{ reviewItem()!.departureAt | date:'mediumDate' }}</p>

              <div class="bg-ivory-50 rounded-lg p-4">
                <h4 class="font-medium text-text-primary mb-3">{{ 'PUBLIC_INFO' | translate }}</h4>
                <div class="space-y-1 text-sm">
                  <p><span class="text-text-muted">{{ 'AVAILABILITY' | translate }}:</span> <span class="text-text-primary">{{ reviewItem()!.availabilityStatus }}</span></p>
                  <p><span class="text-text-muted">{{ 'VERIFICATION_STATUS' | translate }}:</span> <span class="text-text-primary">{{ reviewItem()!.verificationStatus }}</span></p>
                </div>
              </div>

              <div class="bg-primary-50 rounded-lg p-4">
                <h4 class="font-medium text-text-primary mb-3">{{ 'PRIVATE_SUBMITTER_INFO' | translate }}</h4>
                <div class="space-y-1 text-sm">
                  <p><span class="text-text-muted">{{ 'SUBMITTER_NAME' | translate }}:</span> <span class="text-text-primary">{{ reviewItem()!.submitterName }}</span></p>
                  <p><span class="text-text-muted">{{ 'SUBMITTER_PHONE' | translate }}:</span> <span class="text-text-primary">{{ reviewItem()!.submitterPhone }}</span></p>
                  @if (reviewItem()!.submitterEmail) {
                    <p><span class="text-text-muted">{{ 'SUBMITTER_EMAIL' | translate }}:</span> <span class="text-text-primary">{{ reviewItem()!.submitterEmail }}</span></p>
                  }
                  @if (reviewItem()!.whatsAppNumber) {
                    <p><span class="text-text-muted">{{ 'WHATSAPP_NUMBER' | translate }}:</span> <span class="text-text-primary">{{ reviewItem()!.whatsAppNumber }}</span></p>
                  }
                  <p><span class="text-text-muted">{{ 'PREFERRED_CONTACT' | translate }}:</span> <span class="text-text-primary">{{ reviewItem()!.preferredContactMethod }}</span></p>
                </div>
              </div>

              @if (isOwnSubmission(reviewItem()!.submitterUserId)) {
                <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p class="text-sm text-amber-800">{{ 'CANNOT_APPROVE_OWN' | translate }}</p>
                </div>
              } @else {
                <form (ngSubmit)="submitReview()" #reviewForm="ngForm">
                  <div class="space-y-4">
                    <div>
                      <label class="label">{{ 'ACTION' | translate }} <span class="text-error">*</span></label>
                      <select class="input" [(ngModel)]="reviewData.action" name="action" required>
                        <option value="">{{ 'SELECT_ACTION' | translate }}</option>
                        <option value="Approve">{{ 'APPROVE' | translate }}</option>
                        <option value="RequestChanges">{{ 'REQUEST_CHANGES' | translate }}</option>
                        <option value="Reject">{{ 'REJECT' | translate }}</option>
                        <option value="Suspend">{{ 'SUSPEND' | translate }}</option>
                      </select>
                    </div>

                    <div>
                      <label class="label">{{ 'MODERATION_REASON' | translate }} <span class="text-error">*</span></label>
                      <textarea class="input" [(ngModel)]="reviewData.reason" name="reason" rows="3" required maxlength="1000" placeholder="{{ 'REASON_PLACEHOLDER' | translate }}"></textarea>
                    </div>

                    <div class="flex gap-3 pt-2">
                      <jc-button type="button" variant="outline" [label]="'CANCEL' | translate" [fullWidth]="true" (clicked)="closeReviewModal()" />
                      <jc-button type="submit" variant="primary" [label]="'CONFIRM_ACTION' | translate" [fullWidth]="true" [loading]="reviewSubmitting()" [disabled]="reviewSubmitting() || !reviewForm.form.valid || isOwnSubmission(reviewItem()!.submitterUserId)" />
                    </div>
                  </div>
                </form>
              }
            </div>
          </jc-card>
        </div>
      </div>
    }
  `
})
export class QueueComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  auth = inject(AuthService);

  queueItems = signal<ModerationQueueItemDto[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = 20;
  totalPages = signal(0);
  totalCount = signal(0);
  activeTab = signal<'pending' | 'reports' | 'enquiries'>('pending');

  tabs = [
    { id: 'pending' as const, label: 'PENDING_REVIEW', count: 0 },
    { id: 'reports' as const, label: 'LISTING_REPORTS', count: 0 },
    { id: 'enquiries' as const, label: 'ENQUIRY_MODERATION', count: 0 }
  ];

  reviewItem = signal<ModerationQueueItemDto | null>(null);
  reviewSubmitting = signal(false);
  reviewData = { action: '', reason: '' };

  ngOnInit(): void {
    this.loadQueue();
  }

  loadQueue(): void {
    this.loading.set(true);
    if (this.activeTab() === 'pending') {
      this.api.getModerationQueue(this.currentPage(), this.pageSize).subscribe({
        next: (result) => {
          this.queueItems.set(result.items);
          this.totalPages.set(result.totalPages);
          this.totalCount.set(result.totalCount);
          this.tabs[0].count = result.totalCount;
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load moderation queue', err);
          this.loading.set(false);
        }
      });
    } else if (this.activeTab() === 'reports') {
      this.api.getReports(this.currentPage(), this.pageSize).subscribe({
        next: (result) => {
          this.queueItems.set(result.items.map(r => ({
            id: r.id,
            title: r.listingTitle,
            departureLocationName: '',
            departureAt: null,
            durationDays: null,
            publicationStatus: r.status,
            verificationStatus: '',
            availabilityStatus: 'Unknown',
            submitterName: '',
            submitterPhone: '',
            submitterEmail: null,
            whatsAppNumber: null,
            preferredContactMethod: '',
            submitterUserId: '',
            createdAt: r.createdAt
          })));
          this.totalPages.set(result.totalPages);
          this.totalCount.set(result.totalCount);
          this.tabs[1].count = result.totalCount;
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load reports', err);
          this.loading.set(false);
        }
      });
    }
  }

  setActiveTab(tab: 'pending' | 'reports' | 'enquiries'): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.loadQueue();
  }

  openReviewModal(item: ModerationQueueItemDto): void {
    this.reviewItem.set(item);
    this.reviewData = { action: '', reason: '' };
  }

  closeReviewModal(): void {
    this.reviewItem.set(null);
    this.reviewData = { action: '', reason: '' };
  }

  async submitReview(): Promise<void> {
    if (!this.reviewItem() || !this.reviewData.action || !this.reviewData.reason) return;
    if (this.isOwnSubmission(this.reviewItem()!.submitterUserId)) return;

    this.reviewSubmitting.set(true);
    try {
      switch (this.reviewData.action) {
        case 'Approve':
          await this.api.approveListing(this.reviewItem()!.id, this.reviewData.reason).toPromise();
          break;
        case 'RequestChanges':
          await this.api.requestListingChanges(this.reviewItem()!.id, this.reviewData.reason).toPromise();
          break;
        case 'Reject':
          await this.api.rejectListing(this.reviewItem()!.id, this.reviewData.reason).toPromise();
          break;
        case 'Suspend':
          await this.api.suspendListing(this.reviewItem()!.id, this.reviewData.reason).toPromise();
          break;
      }
      this.closeReviewModal();
      this.loadQueue();
      alert('Action completed successfully!'); // TODO: Toast
    } catch (error) {
      console.error('Review action failed', error);
    } finally {
      this.reviewSubmitting.set(false);
    }
  }

  isOwnSubmission(submitterUserId: string): boolean {
    const user = this.auth.user();
    return user?.id === submitterUserId;
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
      this.loadQueue();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
      this.loadQueue();
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved': return 'badge-success';
      case 'PendingReview': return 'badge-warning';
      case 'ChangesRequested': return 'badge-info';
      case 'Rejected': return 'badge-error';
      case 'Suspended': return 'badge-error';
      case 'Cancelled': return 'badge-error';
      case 'Expired': return 'badge-error';
      case 'Pending': return 'badge-warning';
      case 'Reviewed': return 'badge-success';
      default: return 'badge-info';
    }
  }

  getStatusBorderClass(status: string): string {
    switch (status) {
      case 'Approved': return 'border-success';
      case 'PendingReview': return 'border-warning';
      case 'ChangesRequested': return 'border-info';
      case 'Rejected': return 'border-error';
      case 'Suspended': return 'border-error';
      case 'Cancelled': return 'border-error';
      case 'Expired': return 'border-error';
      default: return 'border-primary';
    }
  }
}