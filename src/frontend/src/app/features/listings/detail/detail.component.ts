import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ApiService, ListingDetailDto, CreateEnquiryRequest, CreateListingReportRequest } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';
import { LanguageService } from '@app/core/services/language.service';

@Component({
  selector: 'jc-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (loading()) {
        <div class="card animate-pulse">
          <div class="card-body">
            <div class="skeleton h-8 w-3/4 mb-4"></div>
            <div class="skeleton h-4 w-full mb-2"></div>
            <div class="skeleton h-4 w-2/3 mb-4"></div>
            <div class="skeleton h-6 w-24"></div>
          </div>
        </div>
      } @else if (listing()) {
        <jc-card>
          <div class="card-header">
            <div class="flex items-start justify-between gap-4">
              <h1 class="text-2xl font-bold text-text-primary">{{ listing()!.title }}</h1>
              <span class="badge" [class]="getVerificationBadgeClass()">{{ listing()!.verificationStatus | translate }}</span>
            </div>
          </div>
          <div class="card-body space-y-6">
            <!-- Publication Status -->
            <div class="flex items-center gap-2 text-sm">
              <span class="badge" [class]="getPublicationBadgeClass()">{{ listing()!.publicationStatus | translate }}</span>
              <span class="text-text-muted">{{ 'LAST_UPDATED' | translate }} {{ listing()!.updatedAt | date:'medium' }}</span>
            </div>

            <!-- Key Details Grid -->
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div class="flex items-center gap-2 p-3 bg-ivory-50 rounded-lg">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                <div>
                  <p class="text-xs text-text-muted">{{ 'DEPARTURE_LOCATION' | translate }}</p>
                  <p class="font-medium text-text-primary">{{ listing()!.departureLocationName }}</p>
                </div>
              </div>

              @if (listing()!.departureAt) {
                <div class="flex items-center gap-2 p-3 bg-ivory-50 rounded-lg">
                  <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <div>
                    <p class="text-xs text-text-muted">{{ 'DEPARTURE_DATE' | translate }}</p>
                    <p class="font-medium text-text-primary">{{ listing()!.departureAt | date:'mediumDate' }}</p>
                  </div>
                </div>
              }

              @if (listing()!.durationDays) {
                <div class="flex items-center gap-2 p-3 bg-ivory-50 rounded-lg">
                  <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <div>
                    <p class="text-xs text-text-muted">{{ 'DURATION_DAYS' | translate }}</p>
                    <p class="font-medium text-text-primary">{{ listing()!.durationDays }} {{ 'DAYS' | translate }}</p>
                  </div>
                </div>
              }

              <div class="flex items-center gap-2 p-3 bg-ivory-50 rounded-lg">
                <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <div>
                  <p class="text-xs text-text-muted">{{ 'AVAILABILITY' | translate }}</p>
                  <p class="font-medium text-text-primary">{{ listing()!.availabilityStatus }}</p>
                </div>
              </div>
            </div>

            @if (listing()!.destinationText || listing()!.destinationLocationName) {
              <div class="p-4 bg-primary-50 rounded-lg">
                <h3 class="font-medium text-text-primary mb-2">{{ 'DESTINATION' | translate }}</h3>
                <p class="text-text-primary">
                  @if (listing()!.destinationLocationName) {
                    {{ listing()!.destinationLocationName }}
                  } @else {
                    {{ listing()!.destinationText }}
                  }
                </p>
              </div>
            }

            @if (listing()!.description) {
              <div>
                <h3 class="font-medium text-text-primary mb-2">{{ 'DESCRIPTION' | translate }}</h3>
                <p class="text-text-primary whitespace-pre-wrap">{{ listing()!.description }}</p>
              </div>
            }

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-4 pt-4 border-t border-ivory-200">
              <jc-button 
                variant="primary" 
                [label]="'SEND_ENQUIRY' | translate" 
                [icon]="enquiryIcon"
                (clicked)="openEnquiryModal()"
                [disabled]="!listing()!.canEnquire"
              />
              <jc-button 
                variant="outline" 
                [label]="'REPORT_LISTING' | translate" 
                (clicked)="openReportModal()"
                [disabled]="!listing()!.canReport"
              />
            </div>

            <!-- Travel Warning -->
            <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                <p class="text-sm text-amber-800">{{ 'CONFIRM_TRAVEL' | translate }}</p>
              </div>
            </div>
          </div>
        </jc-card>
      } @else {
        <div class="text-center py-16">
          <p class="text-text-muted">{{ 'NOT_FOUND' | translate }}</p>
          <jc-button variant="primary" [label]="'BROWSE_LISTINGS' | translate" (clicked)="goToSearch()" class="mt-4" />
        </div>
      }
    </div>

    <!-- Enquiry Modal -->
    @if (showEnquiryModal()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" (click)="closeEnquiryModal()"></div>
          <jc-card class="w-full max-w-md relative" [customClass]="'shadow-xl'">
            <div class="card-header">
              <h2 id="enquiry-title" class="text-xl font-bold text-text-primary">{{ 'ENQUIRY_TITLE' | translate }}</h2>
              <button type="button" class="absolute right-4 top-4 text-text-muted hover:text-text-primary" (click)="closeEnquiryModal()">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="card-body space-y-4">
              <p class="text-sm text-text-muted">{{ 'ENQUIRY_DESC' | translate }}</p>
              
              <form (ngSubmit)="submitEnquiry()">
                <div>
                  <label class="label">{{ 'ENQUIRY_NAME' | translate }} <span class="text-error">*</span></label>
                  <input type="text" class="input" [(ngModel)]="enquiryData.senderName" name="senderName" required maxlength="100" />
                </div>

                <div>
                  <label class="label">{{ 'ENQUIRY_MESSAGE' | translate }} <span class="text-error">*</span></label>
                  <textarea class="input" [(ngModel)]="enquiryData.message" name="message" rows="4" required maxlength="1000" placeholder="{{ 'ENQUIRY_MESSAGE_PLACEHOLDER' | translate }}"></textarea>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <div>
                    <label class="label">{{ 'ENQUIRY_PHONE' | translate }} (Optional)</label>
                    <input type="tel" class="input" [(ngModel)]="enquiryData.senderPhone" name="senderPhone" placeholder="+8801XXXXXXXXX" maxlength="20" />
                  </div>
                  <div>
                    <label class="label">{{ 'ENQUIRY_WHATSAPP' | translate }} (Optional)</label>
                    <input type="tel" class="input" [(ngModel)]="enquiryData.senderWhatsApp" name="senderWhatsApp" placeholder="+8801XXXXXXXXX" maxlength="20" />
                  </div>
                </div>

                <div class="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                  <input type="checkbox" class="mt-1 w-4 h-4 text-primary-600 border-ivory-300 rounded focus:ring-primary-500" [(ngModel)]="enquiryData.consentToShareContact" name="consentToShareContact" />
                  <div class="text-sm">
                    <label class="text-text-primary">{{ 'ENQUIRY_CONSENT' | translate }}</label>
                    <p class="text-xs text-text-muted mt-1">{{ 'ENQUIRY_CONSENT_DESC' | translate }}</p>
                  </div>
                </div>

                <div class="flex gap-3 pt-2">
                  <jc-button type="button" variant="outline" [label]="'CANCEL' | translate" [fullWidth]="true" (clicked)="closeEnquiryModal()" />
                  <jc-button type="submit" variant="primary" [label]="'SEND_ENQUIRY' | translate" [fullWidth]="true" [loading]="enquirySubmitting()" [disabled]="enquirySubmitting()" />
                </div>
              </form>
            </div>
          </jc-card>
        </div>
      </div>
    }

    <!-- Report Modal -->
    @if (showReportModal()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" (click)="closeReportModal()"></div>
          <jc-card class="w-full max-w-md relative" [customClass]="'shadow-xl'">
            <div class="card-header">
              <h2 id="report-title" class="text-xl font-bold text-text-primary">{{ 'REPORT_LISTING' | translate }}</h2>
              <button type="button" class="absolute right-4 top-4 text-text-muted hover:text-text-primary" (click)="closeReportModal()">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="card-body space-y-4">
              <p class="text-sm text-text-muted">{{ 'REPORT_DESC' | translate }}</p>
              
              <form (ngSubmit)="submitReport()">
                <div>
                  <label class="label">{{ 'REPORT_REASON' | translate }} <span class="text-error">*</span></label>
                  <select class="input" [(ngModel)]="reportData.reason" name="reason" required>
                    <option value="">{{ 'SELECT_REASON' | translate }}</option>
                    <option value="Misleading">{{ 'REPORT_MISLEADING' | translate }}</option>
                    <option value="Inappropriate">{{ 'REPORT_INAPPROPRIATE' | translate }}</option>
                    <option value="Spam">{{ 'REPORT_SPAM' | translate }}</option>
                    <option value="Duplicate">{{ 'REPORT_DUPLICATE' | translate }}</option>
                    <option value="Other">{{ 'OTHER' | translate }}</option>
                  </select>
                </div>

                <div>
                  <label class="label">{{ 'REPORT_DESCRIPTION' | translate }} <span class="text-error">*</span></label>
                  <textarea class="input" [(ngModel)]="reportData.description" name="description" rows="4" required maxlength="2000" placeholder="{{ 'REPORT_DESCRIPTION_PLACEHOLDER' | translate }}"></textarea>
                </div>

                <div class="flex gap-3 pt-2">
                  <jc-button type="button" variant="outline" [label]="'CANCEL' | translate" [fullWidth]="true" (clicked)="closeReportModal()" />
                  <jc-button type="submit" variant="primary" [label]="'SUBMIT_REPORT' | translate" [fullWidth]="true" [loading]="reportSubmitting()" [disabled]="reportSubmitting()" />
                </div>
              </form>
            </div>
          </jc-card>
        </div>
      </div>
    }
  `
})
export class DetailComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);
  lang = inject(LanguageService);

  listing = signal<ListingDetailDto | null>(null);
  loading = signal(true);
  private destroy$ = new Subject<void>();

  // Enquiry modal
  showEnquiryModal = signal(false);
  enquirySubmitting = signal(false);
  enquiryData: CreateEnquiryRequest = {
    listingId: '',
    senderName: '',
    senderPhone: '',
    senderWhatsApp: '',
    consentToShareContact: false,
    message: ''
  };

  // Report modal
  showReportModal = signal(false);
  reportSubmitting = signal(false);
  reportData: CreateListingReportRequest = {
    listingId: '',
    reason: '',
    description: ''
  };

  enquiryIcon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>';

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadListing(id);
      }
    });

    // Pre-fill user name if authenticated
    if (this.auth.isAuthenticated() && this.auth.user()) {
      this.enquiryData.senderName = this.auth.user()?.displayName || '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadListing(id: string): void {
    this.loading.set(true);
    this.api.getListing(id).subscribe({
      next: (data) => {
        this.listing.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load listing', err);
        this.loading.set(false);
      }
    });
  }

  getVerificationBadgeClass(): string {
    const status = this.listing()?.verificationStatus;
    if (status === 'Verified') return 'badge-success';
    if (status === 'VerificationExpired') return 'badge-warning';
    if (status === 'VerificationRejected') return 'badge-error';
    return 'badge-info';
  }

  getPublicationBadgeClass(): string {
    const status = this.listing()?.publicationStatus;
    if (status === 'Approved') return 'badge-success';
    if (status === 'PendingReview') return 'badge-warning';
    if (status === 'ChangesRequested') return 'badge-info';
    return 'badge-error';
  }

  openEnquiryModal(): void {
    if (this.listing()) {
      this.enquiryData.listingId = this.listing()!.id;
      this.showEnquiryModal.set(true);
    }
  }

  closeEnquiryModal(): void {
    this.showEnquiryModal.set(false);
    this.resetEnquiryForm();
  }

  async submitEnquiry(): Promise<void> {
    if (!this.enquiryData.senderName || !this.enquiryData.message) return;
    
    this.enquirySubmitting.set(true);
    try {
      await this.api.createEnquiry(this.enquiryData).toPromise();
      this.closeEnquiryModal();
      // Show success toast (simplified)
      alert('Enquiry sent successfully!'); // TODO: Replace with toast service
    } catch (error) {
      console.error('Enquiry submission failed', error);
    } finally {
      this.enquirySubmitting.set(false);
    }
  }

  resetEnquiryForm(): void {
    this.enquiryData = {
      listingId: '',
      senderName: '',
      senderPhone: '',
      senderWhatsApp: '',
      consentToShareContact: false,
      message: ''
    };
    if (this.auth.isAuthenticated() && this.auth.user()) {
      this.enquiryData.senderName = this.auth.user()?.displayName || '';
    }
  }

  openReportModal(): void {
    if (this.listing()) {
      this.reportData.listingId = this.listing()!.id;
      this.showReportModal.set(true);
    }
  }

  closeReportModal(): void {
    this.showReportModal.set(false);
    this.reportData = { listingId: '', reason: '', description: '' };
  }

  async submitReport(): Promise<void> {
    if (!this.reportData.reason || !this.reportData.description) return;
    
    this.reportSubmitting.set(true);
    try {
      await this.api.createReport(this.reportData.listingId, this.reportData).toPromise();
      this.closeReportModal();
      alert('Report submitted successfully!'); // TODO: Replace with toast service
    } catch (error) {
      console.error('Report submission failed', error);
    } finally {
      this.reportSubmitting.set(false);
    }
  }

  goToSearch(): void {
    this.router.navigate(['/search']);
  }
}