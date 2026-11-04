import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'jc-verify-email', standalone: true, imports: [FormsModule, CardComponent, ButtonComponent],
  template: `<div class="min-h-screen flex items-center justify-center px-4 py-12"><jc-card class="w-full max-w-md"><div class="card-header text-center"><h1 class="text-2xl font-bold">Verify your email / ইমেইল যাচাই করুন</h1></div><div class="card-body space-y-4">
    <p class="text-sm text-text-muted">Enter the code we sent to your email to activate your account. / আপনার অ্যাকাউন্ট চালু করতে ইমেইলে পাঠানো কোডটি দিন।</p>
    @if (error()) { <div class="rounded-xl bg-error/10 p-3 text-sm text-error">{{ error() }}</div> }
    <label class="label">Email</label><input class="input" type="email" [(ngModel)]="email" name="email" required />
    <label class="label">Verification code / যাচাইকরণ কোড</label><input class="input" inputmode="numeric" maxlength="6" [(ngModel)]="code" name="code" required />
    <jc-button variant="primary" label="Verify and continue / যাচাই করে এগিয়ে যান" [fullWidth]="true" (clicked)="verify()" />
  </div></jc-card></div>`
})
export class VerifyEmailComponent {
  private auth = inject(AuthService); private router = inject(Router);
  email = (history.state?.email as string | undefined) ?? ''; code = ''; error = signal('');
  verify(): void { this.error.set(''); this.auth.verifyRegistration(this.email.trim(), this.code.trim()).subscribe({ next: () => this.router.navigate(['/search']), error: e => this.error.set(e?.error?.error || 'Unable to verify email.') }); }
}
