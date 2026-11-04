import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { AuthService } from '@app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'jc-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
      <jc-card class="w-full max-w-md">
        <div class="card-header text-center">
          <h1 class="text-2xl font-bold text-text-primary">{{ 'REGISTER' | translate }}</h1>
        </div>
        <div class="card-body space-y-4">
          @if (errorMessage()) {
            <div class="mb-4 rounded-xl border border-error/20 bg-error/10 px-3 py-2 text-sm text-error" role="alert">{{ errorMessage() }}</div>
          }
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <div>
              <label class="label">{{ 'DISPLAY_NAME' | translate }}</label>
              <input type="text" class="input" required [(ngModel)]="displayName" name="displayName" />
            </div>
            <div>
              <label class="label">{{ 'EMAIL' | translate }}</label>
              <input type="email" class="input" required [(ngModel)]="email" name="email" />
            </div>
            <div>
              <label class="label">{{ 'PASSWORD' | translate }}</label>
              <input type="password" class="input" required [(ngModel)]="password" name="password" />
            </div>
            <div>
              <label class="label">{{ 'CONFIRM_PASSWORD' | translate }}</label>
              <input type="password" class="input" required [(ngModel)]="confirmPassword" name="confirmPassword" />
            </div>
            <jc-button type="submit" variant="primary" [label]="'REGISTER' | translate" [loading]="loading()" [disabled]="!!registerForm.invalid" [fullWidth]="true" />
          </form>
          <p class="text-center text-sm text-text-muted">
            {{ 'LOGIN' | translate }}
            <a routerLink="/auth/login" class="text-primary-700 hover:underline ml-1">{{ 'LOGIN' | translate }}</a>
          </p>
        </div>
      </jc-card>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  errorMessage = signal('');

  onSubmit(): void {
    if (this.loading()) return;
    this.errorMessage.set('');
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.auth.register({
      displayName: this.displayName.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => this.router.navigate(['/auth/verify-email'], { state: { email: this.email.trim() } }),
      error: (error) => {
        const errors = error?.error?.errors;
        this.errorMessage.set(Array.isArray(errors) ? errors.join(' ') : (error?.error?.error || 'Unable to create your account.'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}
