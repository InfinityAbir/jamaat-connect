import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ApiService, ListingSummaryDto, UpdateListingRequest } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';

interface SubmissionWithStatus extends ListingSummaryDto {
  statusDisplay: string;
  canEdit: boolean;
  canWithdraw: boolean;
}

@Component({
  selector: 'jc-submissions',
  standalone: true,
  imports: [CommonModule, TranslatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-text-primary">{{ 'SUBMISSIONS' | translate }}</h1>
        <jc-button variant="primary" [label]="'SUBMIT_LISTING' | translate" [icon]="submitIcon" (clicked)="goToSubmit()" />
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
      } @else if (submissions().length === 0) {
        <jc-card>
          <div class="card-body text-center py-16">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-ivory-200 flex items-center justify-center">
              <svg class="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </div>
            <h3 class="text-lg font-medium text-text-primary mb-2">{{ 'NO_SUBMISSIONS' | translate }}</h3>
            <p class="text-text-muted mb-6">{{ 'NO_SUBMISSIONS_DESC' | translate }}</p>
            <jc-button variant="primary" [label]="'SUBMIT_LISTING' | translate" [icon]="submitIcon" (clicked)="goToSubmit()" />
          </div>
        </jc-card>
      } @else {
        <div class="space-y-4">
          @for (submission of submissions(); track submission.id) {
            <jc-card>
              <div class="card-body">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-text-primary truncate">{{ submission.title }}</h3>
                      <span class="badge" [class]="getStatusBadgeClass(submission.statusDisplay)">{{ submission.statusDisplay | translate }}</span>
                    </div>
                    <div class="space-y-2 text-sm text-text-muted">
                      <div class="flex items-center gap-1.5">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                        <span>{{ submission.departureLocationName }}</span>
                      </div>
                      @if (submission.departureAt) {
                        <div class="flex items-center gap-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          <span>{{ submission.departureAt | date:'mediumDate' }}</span>
                        </div>
                      }
                      @if (submission.durationDays) {
                        <div class="flex items-center gap-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span>{{ submission.durationDays }} {{ 'DAYS' | translate }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
                    @if (submission.canEdit) {
                      <jc-button variant="outline" size="sm" [label]="'EDIT' | translate" (clicked)="editSubmission(submission)" />
                    }
                    @if (submission.canWithdraw) {
                      <jc-button variant="outline" size="sm" [label]="'WITHDRAW' | translate" (clicked)="confirmWithdraw(submission)" />
                    }
                    <jc-button variant="secondary" size="sm" [label]="'VIEW' | translate" [routerLink]="['/listing', submission.id]" />
                  </div>
                </div>
              </div>
            </jc-card>
          }
        </div>
      }
    </div>
  `
})
export class SubmissionsComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  auth = inject(AuthService);

  submissions = signal<SubmissionWithStatus[]>([]);
  loading = signal(true);

  submitIcon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>';

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.loading.set(true);
    this.api.getMySubmissions().subscribe({
      next: (data) => {
        const mapped: SubmissionWithStatus[] = data.map(s => ({
          ...s,
          statusDisplay: s.verificationStatus, // Will use publication status from API
          canEdit: s.verificationStatus === 'PendingReview' || s.verificationStatus === 'ChangesRequested',
          canWithdraw: s.verificationStatus === 'PendingReview' || s.verificationStatus === 'ChangesRequested'
        }));
        this.submissions.set(mapped);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load submissions', err);
        this.loading.set(false);
      }
    });
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
      default: return 'badge-info';
    }
  }

  editSubmission(submission: SubmissionWithStatus): void {
    this.router.navigate(['/submit'], { queryParams: { edit: submission.id } });
  }

  confirmWithdraw(submission: SubmissionWithStatus): void {
    if (confirm('Are you sure you want to withdraw this submission?')) {
      this.withdrawSubmission(submission.id);
    }
  }

  withdrawSubmission(id: string): void {
    this.api.withdrawListing(id).subscribe({
      next: () => this.loadSubmissions(),
      error: (err) => console.error('Withdraw failed', err)
    });
  }

  goToSubmit(): void {
    this.router.navigate(['/submit']);
  }
}