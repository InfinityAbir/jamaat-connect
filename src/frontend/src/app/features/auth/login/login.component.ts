import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { AuthService } from '@app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'jc-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, CardComponent, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
      <jc-card class="w-full max-w-md">
        <div class="card-header text-center">
          <h1 class="text-2xl font-bold text-text-primary">{{ 'LOGIN' | translate }}</h1>
        </div>
        <div class="card-body space-y-4">
          @if (errorMessage()) {
            <div class="mb-4 rounded-xl border border-error/20 bg-error/10 px-3 py-2 text-sm text-error" role="alert">{{ errorMessage() }}</div>
          }
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div>
              <label class="label">{{ 'EMAIL' | translate }}</label>
              <input type="email" class="input" required [(ngModel)]="email" name="email" />
            </div>
            <div>
              <label class="label">{{ 'PASSWORD' | translate }}</label>
              <input type="password" class="input" required [(ngModel)]="password" name="password" />
            </div>
            <jc-button type="submit" variant="primary" [label]="'LOGIN' | translate" [loading]="loading()" [disabled]="!!loginForm.invalid" [fullWidth]="true" />
          </form>
          <button type="button" class="w-full text-center text-sm font-medium text-primary-700 hover:underline" (click)="goForgotPassword()">Forgot password? / পাসওয়ার্ড ভুলে গেছেন?</button>
          <div class="pt-1 text-center">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 hover:text-primary-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              (click)="goRegister()"
            >
              <span>New here?</span>
              <span class="underline underline-offset-4">{{ 'REGISTER' | translate }}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </jc-card>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  goRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  goForgotPassword(): void { this.router.navigate(['/auth/forgot-password']); }

  onSubmit(): void {
    if (this.loading()) return;
    this.errorMessage.set('');
    this.loading.set(true);
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => this.router.navigate([this.auth.user()?.mustChangeCredentials ? '/profile' : '/search']),
      error: (error) => {
        this.errorMessage.set(error?.error?.error || 'Unable to sign in. Please check your email and password.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }
}
