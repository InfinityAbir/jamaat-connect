import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'jc-forgot-password', standalone: true, imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12"><jc-card class="w-full max-w-md"><div class="card-header text-center"><h1 class="text-2xl font-bold">Reset password / পাসওয়ার্ড রিসেট</h1></div><div class="card-body space-y-4">
      <p class="text-sm text-text-muted">We will email a code that expires in 30 seconds. / আমরা ৩০ সেকেন্ডের জন্য কার্যকর একটি কোড ইমেইল করব।</p>
      @if (message()) { <div class="rounded-xl bg-primary-50 p-3 text-sm text-primary-800">{{ message() }}</div> }
      @if (error()) { <div class="rounded-xl bg-error/10 p-3 text-sm text-error">{{ error() }}</div> }
      <form (ngSubmit)="sendCode()" class="space-y-3"><label class="label">Email</label><input class="input" type="email" [(ngModel)]="email" name="email" required /><jc-button type="submit" variant="outline" [fullWidth]="true" label="Send code / কোড পাঠান" /></form>
      <form (ngSubmit)="reset()" class="space-y-3 border-t pt-4"><label class="label">Verification code</label><input class="input" inputmode="numeric" maxlength="6" [(ngModel)]="code" name="code" required /><label class="label">New password</label><input class="input" type="password" [(ngModel)]="newPassword" name="newPassword" required /><jc-button type="submit" variant="primary" [fullWidth]="true" label="Update password / পাসওয়ার্ড বদলান" /></form>
      <button class="w-full text-sm text-primary-700 hover:underline" (click)="router.navigate(['/auth/login'])">Back to login / লগইনে ফিরুন</button>
    </div></jc-card></div>`
})
export class ForgotPasswordComponent {
  auth = inject(AuthService); router = inject(Router); email = ''; code = ''; newPassword = ''; message = signal(''); error = signal('');
  sendCode(): void { this.error.set(''); this.auth.forgotPassword(this.email.trim()).subscribe({ next: r => this.message.set(r.message), error: e => this.error.set(e?.error?.error || 'Unable to send code.') }); }
  reset(): void { this.error.set(''); this.auth.resetPassword(this.email.trim(), this.code.trim(), this.newPassword).subscribe({ next: r => { this.message.set(r.message); setTimeout(() => this.router.navigate(['/auth/login']), 800); }, error: e => this.error.set(e?.error?.error || 'Unable to reset password.') }); }
}
