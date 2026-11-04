import { Component, signal, computed, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { ApiService, CreateListingRequest, LocationDto } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';
import { LanguageService } from '@app/core/services/language.service';

type Step = 1 | 2 | 3 | 4 | 5;

interface StepConfig {
  number: Step;
  titleKey: string;
  subtitleKey: string;
}

const STEPS: StepConfig[] = [
  { number: 1, titleKey: 'STEP_BASIC_INFO', subtitleKey: 'STEP_BASIC_INFO_DESC' },
  { number: 2, titleKey: 'STEP_DETAILS', subtitleKey: 'STEP_DETAILS_DESC' },
  { number: 3, titleKey: 'STEP_CONTACT', subtitleKey: 'STEP_CONTACT_DESC' },
  { number: 4, titleKey: 'STEP_PREVIEW', subtitleKey: 'STEP_PREVIEW_DESC' },
  { number: 5, titleKey: 'STEP_CONFIRMATION', subtitleKey: 'STEP_CONFIRMATION_DESC' }
];

// Step 1: Basic Info Component
export @Component({
  selector: 'app-step-basic-info',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, ButtonComponent],
  template: `
    <div class="space-y-6">
      <div>
        <label class="label">{{ 'TITLE' | translate }} <span class="text-error">*</span></label>
        <input type="text" class="input" [(ngModel)]="formData.title" [placeholder]="'TITLE_PLACEHOLDER' | translate" required maxlength="200" />
      </div>

      <div>
        <label class="label">{{ 'DEPARTURE_LOCATION' | translate }} <span class="text-error">*</span></label>
        <select class="input" [(ngModel)]="formData.departureLocationId" (ngModelChange)="onLocationChange($event)" required>
          <option value="">{{ 'SELECT_LOCATION' | translate }}</option>
          @for (loc of locations; track loc.id) {
            <option [value]="loc.id">{{ loc.name }}</option>
          }
        </select>
      </div>

      @if (formData.departureLocationId && subLocations.length > 0) {
        <div>
          <label class="label">{{ 'SUB_LOCATION' | translate }}</label>
          <select class="input" [(ngModel)]="formData.departureLocationId" (ngModelChange)="onLocationChange($event)">
            <option value="">{{ 'ALL' | translate }}</option>
            @for (loc of subLocations; track loc.id) {
              <option [value]="loc.id">{{ loc.name }}</option>
            }
          </select>
        </div>
      }

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="label">{{ 'DATE_STATUS' | translate }} <span class="text-error">*</span></label>
          <select class="input" [(ngModel)]="formData.dateStatus">
            <option value="Confirmed">{{ 'DATE_CONFIRMED' | translate }}</option>
            <option value="Undecided">{{ 'DATE_UNDECIDED' | translate }}</option>
          </select>
        </div>

        <div>
          <label class="label" [class.required]="formData.dateStatus === 'Confirmed'">{{ 'DEPARTURE_DATE' | translate }}</label>
          <input type="date" class="input" [(ngModel)]="formData.departureAt" [disabled]="formData.dateStatus === 'Undecided'" [required]="formData.dateStatus === 'Confirmed'" [min]="today" />
        </div>
      </div>

      <div>
        <label class="label">{{ 'AVAILABILITY' | translate }} <span class="text-error">*</span></label>
        <select class="input" [(ngModel)]="formData.availabilityStatus" required>
          <option value="Available">{{ 'AVAILABILITY_AVAILABLE' | translate }}</option>
          <option value="Limited">{{ 'AVAILABILITY_LIMITED' | translate }}</option>
          <option value="Full">{{ 'AVAILABILITY_FULL' | translate }}</option>
        </select>
      </div>

      <p class="text-sm text-text-muted">{{ 'REQUIRED_FIELDS_NOTE' | translate }}</p>
    </div>
  `
})
class StepBasicInfoComponent {
  @Input() formData!: CreateListingRequest;
  @Input() locations!: LocationDto[];
  @Input() subLocations: LocationDto[] = [];
  @Output() next = new EventEmitter<void>();
  @Output() locationChange = new EventEmitter<string>();

  today = new Date().toISOString().split('T')[0];

  onLocationChange(value: string): void {
    this.locationChange.emit(value);
  }
}

// Step 2: Details Component
export @Component({
  selector: 'app-step-details',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div>
        <label class="label">{{ 'DURATION_DAYS' | translate }}</label>
        <input type="number" class="input" [(ngModel)]="formData.durationDays" [min]="1" [max]="365" placeholder="e.g. 3" />
      </div>

      <div>
        <label class="label">{{ 'DESTINATION' | translate }} (Optional)</label>
        <input type="text" class="input" [(ngModel)]="formData.destinationText" placeholder="{{ 'DESTINATION_PLACEHOLDER' | translate }}" maxlength="200" />
      </div>

      <div>
        <label class="label">{{ 'DESCRIPTION' | translate }} (Optional)</label>
        <textarea class="input" [(ngModel)]="formData.description" rows="4" placeholder="{{ 'DESCRIPTION_PLACEHOLDER' | translate }}" maxlength="2000"></textarea>
      </div>
    </div>
  `
})
class StepDetailsComponent {
  @Input() formData!: CreateListingRequest;
}

// Step 3: Contact Component
export @Component({
  selector: 'app-step-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-ivory-50 rounded-lg p-4">
        <h4 class="font-medium text-text-primary mb-3">{{ 'PRIVATE_CONTACT_INFO' | translate }}</h4>
        <p class="text-sm text-text-muted mb-4">{{ 'CONTACT_INFO_DESC' | translate }}</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="label">{{ 'SUBMITTER_NAME' | translate }} <span class="text-error">*</span></label>
          <input type="text" class="input" [(ngModel)]="formData.submitterName" required maxlength="100" [disabled]="isAuthenticated" />
          @if (isAuthenticated) {
            <p class="text-xs text-text-muted mt-1">{{ 'PREFILLED_FROM_ACCOUNT' | translate }}</p>
          }
        </div>

        <div>
          <label class="label">{{ 'SUBMITTER_PHONE' | translate }} <span class="text-error">*</span></label>
          <input type="tel" class="input" [(ngModel)]="formData.submitterPhone" required placeholder="+8801XXXXXXXXX" maxlength="20" />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="label">{{ 'SUBMITTER_EMAIL' | translate }} (Optional)</label>
          <input type="email" class="input" [(ngModel)]="formData.submitterEmail" placeholder="email@example.com" maxlength="255" />
        </div>

        <div>
          <label class="label">{{ 'WHATSAPP_NUMBER' | translate }} (Optional)</label>
          <input type="tel" class="input" [(ngModel)]="formData.whatsAppNumber" placeholder="+8801XXXXXXXXX" maxlength="20" />
        </div>
      </div>

      <div>
        <label class="label">{{ 'PREFERRED_CONTACT' | translate }} <span class="text-error">*</span></label>
        <select class="input" [(ngModel)]="formData.preferredContactMethod" required>
          <option value="Phone">{{ 'CONTACT_PHONE' | translate }}</option>
          <option value="WhatsApp">{{ 'CONTACT_WHATSAPP' | translate }}</option>
          <option value="Email">{{ 'CONTACT_EMAIL' | translate }}</option>
        </select>
      </div>

      <div class="flex items-start gap-3 p-4 bg-primary-50 rounded-lg">
        <input type="checkbox" class="mt-1 w-4 h-4 text-primary-600 border-ivory-300 rounded focus:ring-primary-500" [(ngModel)]="formData.consentToShareContact" />
        <div>
          <label class="text-sm text-text-primary">{{ 'CONSENT_SHARE' | translate }} <span class="text-error">*</span></label>
          <p class="text-xs text-text-muted mt-1">{{ 'CONSENT_SHARE_DESC' | translate }}</p>
        </div>
      </div>
    </div>
  `
})
class StepContactComponent {
  @Input() formData!: CreateListingRequest;
  @Input() isAuthenticated = false;
}

// Step 4: Preview Component
export @Component({
  selector: 'app-step-preview',
  standalone: true,
  imports: [CommonModule, TranslatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="space-y-6">
      <p class="text-text-muted">{{ 'PREVIEW_DESC' | translate }}</p>
      
      <jc-card [customClass]="'bg-ivory-50'">
        <div class="card-body">
          <div class="flex items-start justify-between gap-2 mb-3">
            <h3 class="text-lg font-semibold text-text-primary">{{ formData.title }}</h3>
            <span class="badge badge-info">{{ formData.availabilityStatus }}</span>
          </div>
          <div class="space-y-2 text-sm text-text-muted">
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
              <span>{{ getLocationDisplay() }}</span>
            </div>
            @if (formData.departureAt) {
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>{{ formData.departureAt | date:'mediumDate' }} ({{ formData.dateStatus | translate }})</span>
              </div>
            }
            @if (formData.durationDays) {
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>{{ formData.durationDays }} {{ 'DAYS' | translate }}</span>
              </div>
            }
            @if (formData.destinationText) {
              <div class="flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9"/></svg>
                <span>{{ formData.destinationText }}</span>
              </div>
            }
          </div>
          <p class="text-xs text-primary-700 mt-3">{{ 'NOTICE_PUBLIC_PREVIEW' | translate }}</p>
        </div>
      </jc-card>

      <div class="flex justify-between">
        <jc-button variant="outline" [label]="'PREVIOUS_STEP' | translate" (clicked)="prev.emit()" />
        <jc-button variant="primary" [label]="'SUBMIT' | translate" (clicked)="submit.emit()" />
      </div>
    </div>
  `
})
class StepPreviewComponent {
  @Input() formData!: CreateListingRequest;
  @Output() prev = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  getLocationDisplay(): string {
    return 'Dhaka'; // TODO: resolve from location ID
  }
}

@Component({
  selector: 'jc-submit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CardComponent, ButtonComponent, StepBasicInfoComponent, StepDetailsComponent, StepContactComponent, StepPreviewComponent],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stepper -->
      <div class="mb-8" role="navigation" aria-label="Submission progress">
        <div class="flex items-center justify-between">
          @for (step of steps; track step.number; let last = $last) {
            <div class="relative flex items-center flex-1">
              @if (!last) {
                <div class="absolute top-4 left-1/2 right-0 h-1 bg-ivory-200 z-0" [class.bg-primary-600]="isStepCompleted(step.number + 1)"></div>
              }
              <div class="relative z-10 flex flex-col items-center">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  [class]="getStepClass(step.number)"
                >
                  @if (completedSteps().includes(step.number)) {
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  } @else {
                    {{ step.number }}
                  }
                </div>
                <span class="mt-2 text-xs font-medium text-center" [class.text-primary-700]="currentStep() >= step.number" [class.text-text-muted]="currentStep() < step.number">
                  {{ step.titleKey | translate }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      @if (currentStep() < 5) {
        <!-- Step Content -->
        <jc-card>
          <div class="card-header">
            <h1 class="text-xl font-bold text-text-primary">{{ ('STEP' | translate) }} {{ currentStep() }} {{ 'OF' | translate }} 4: {{ getCurrentStepConfig().titleKey | translate }}</h1>
            <p class="text-sm text-text-muted mt-1">{{ getCurrentStepConfig().subtitleKey | translate }}</p>
          </div>
          <div class="card-body">
            @switch (currentStep()) {
              @case (1) {
                <app-step-basic-info 
                  [formData]="formData" 
                  [locations]="topLevelLocations()" 
                  [subLocations]="subLocations()"
                  (next)="nextStep()" 
                  (locationChange)="onLocationChange($event)">
                </app-step-basic-info>
              }
              @case (2) {
                <app-step-details [formData]="formData"></app-step-details>
              }
              @case (3) {
                <app-step-contact [formData]="formData" [isAuthenticated]="auth.isAuthenticated()"></app-step-contact>
              }
              @case (4) {
                <app-step-preview [formData]="formData" (prev)="prevStep()" (submit)="submitListing()"></app-step-preview>
              }
            }
          </div>
        </jc-card>

        <!-- Navigation -->
        <div class="flex justify-between mt-6">
          @if (currentStep() > 1) {
            <jc-button variant="outline" [label]="'PREVIOUS_STEP' | translate" (clicked)="prevStep()" />
          }
          @if (currentStep() < 4) {
            <jc-button variant="primary" [label]="'NEXT_STEP' | translate" [disabled]="!canProceed()" (clicked)="nextStep()" />
          } @else {
            <jc-button variant="primary" [label]="'SUBMIT' | translate" [disabled]="submitting()" [loading]="submitting()" (clicked)="submitListing()" />
          }
        </div>
      } @else {
        <!-- Confirmation Screen -->
        <jc-card [customClass]="'bg-success-50 border-success-200'">
          <div class="card-body text-center py-12">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-success flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h2 class="text-2xl font-bold text-success-800 mb-2">{{ 'SUBMITTED_SUCCESS' | translate }}</h2>
            <p class="text-success-700 mb-6">{{ 'SUBMISSION_CONFIRMED_DESC' | translate }}</p>
            <div class="bg-white rounded-lg p-4 mb-6 text-left border border-success-200">
              <p class="text-sm text-text-muted mb-1">{{ 'REFERENCE_NUMBER' | translate }}</p>
              <p class="text-2xl font-bold text-text-primary font-mono">{{ submissionReference() }}</p>
            </div>
            <p class="text-sm text-success-600 mb-6">{{ 'TRACK_SUBMISSION_DESC' | translate }} <strong>{{ submissionReference() }}</strong></p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <jc-button variant="primary" [label]="'TRACK_SUBMISSION' | translate" [fullWidth]="true" (clicked)="goToTracking()" />
              <jc-button variant="secondary" [label]="'BROWSE_LISTINGS' | translate" [fullWidth]="true" (clicked)="goToSearch()" />
            </div>
          </div>
        </jc-card>
      }
    </div>
  `
})
export class SubmitComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);
  lang = inject(LanguageService);

  steps = STEPS;
  currentStep = signal<Step>(1);
  completedSteps = signal<Step[]>([]);
  submitting = signal(false);
  submissionReference = signal<string>('');

  topLevelLocations = signal<LocationDto[]>([]);
  subLocations = signal<LocationDto[]>([]);

  formData: CreateListingRequest = {
    departureLocationId: '',
    title: '',
    description: '',
    departureAt: undefined,
    dateStatus: 'Confirmed',
    durationDays: undefined,
    destinationLocationId: undefined,
    destinationText: '',
    availabilityStatus: 'Available',
    submitterName: '',
    submitterPhone: '',
    submitterEmail: '',
    whatsAppNumber: '',
    preferredContactMethod: 'Phone',
    consentToShareContact: false
  };

  ngOnInit(): void {
    this.loadTopLevelLocations();
    
    // Pre-fill user info if authenticated
    if (this.auth.isAuthenticated() && this.auth.user()) {
      this.formData.submitterName = this.auth.user()?.displayName || '';
    }
  }

  loadTopLevelLocations(): void {
    this.api.getBangladeshDivisions().subscribe({
      next: (locations) => this.topLevelLocations.set(locations),
      error: (err) => console.error('Failed to load locations', err)
    });
  }

  onLocationChange(parentId: string): void {
    this.formData.departureLocationId = parentId;
    this.subLocations.set([]);
    
    if (parentId) {
      this.api.getLocations(parentId).subscribe({
        next: (locations) => this.subLocations.set(locations),
        error: (err) => console.error('Failed to load sub-locations', err)
      });
    }
  }

  getCurrentStepConfig(): StepConfig {
    return this.steps.find(s => s.number === this.currentStep())!;
  }

  getStepClass(stepNum: Step): string {
    if (this.completedSteps().includes(stepNum)) {
      return 'bg-success text-white';
    }
    if (this.currentStep() === stepNum) {
      return 'bg-primary-600 text-white ring-2 ring-primary-200';
    }
    if (this.currentStep() > stepNum) {
      return 'bg-primary-100 text-primary-700';
    }
    return 'bg-ivory-200 text-text-muted';
  }

  isStepCompleted(stepNum: number): boolean {
    return this.completedSteps().includes(stepNum as Step);
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1:
        return !!this.formData.title && !!this.formData.departureLocationId && 
               (this.formData.dateStatus === 'Undecided' || !!this.formData.departureAt) &&
               !!this.formData.availabilityStatus;
      case 2:
        return true; // Optional fields
      case 3:
        return !!this.formData.submitterName && !!this.formData.submitterPhone && 
               !!this.formData.preferredContactMethod;
      case 4:
        return true;
      default:
        return false;
    }
  }

  nextStep(): void {
    if (this.currentStep() < 4 && this.canProceed()) {
      this.completedSteps.update(steps => [...steps, this.currentStep()]);
      this.currentStep.update(s => (s + 1) as Step);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => (s - 1) as Step);
      this.completedSteps.update(steps => steps.slice(0, -1));
    }
  }

  async submitListing(): Promise<void> {
    this.submitting.set(true);
    
    const payload: CreateListingRequest = {
      ...this.formData,
      departureLocationId: this.formData.destinationLocationId || this.formData.departureLocationId
    };

    try {
      const result = await this.api.createListing(payload).toPromise();
      if (result) {
        this.submissionReference.set(result.referenceNumber);
        this.currentStep.set(5);
      }
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      this.submitting.set(false);
    }
  }

  goToTracking(): void {
    this.router.navigate(['/my/submissions']);
  }

  goToSearch(): void {
    this.router.navigate(['/search']);
  }
}
