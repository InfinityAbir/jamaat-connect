import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '@app/shared/components/card/card.component';
import { ButtonComponent } from '@app/shared/components/button/button.component';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'jc-profile', standalone: true, imports: [FormsModule, CardComponent, ButtonComponent],
  template: `<div class="max-w-xl mx-auto px-4 py-10"><jc-card><div class="card-header"><h1 class="text-2xl font-bold">Your profile / আপনার প্রোফাইল</h1></div><div class="card-body space-y-4">
    @if (auth.user()?.mustChangeCredentials) { <div class="rounded-xl border border-gold-200 bg-gold-50 p-3 text-sm text-gold-800">For security, the seeded administrator must change credentials before continuing. / নিরাপত্তার জন্য প্রথমবার অ্যাডমিন তথ্য পরিবর্তন করুন।</div> }
    @if (message()) { <div class="rounded-xl bg-primary-50 p-3 text-sm text-primary-800">{{ message() }}</div> } @if (error()) { <div class="rounded-xl bg-error/10 p-3 text-sm text-error">{{ error() }}</div> }
    <label class="label">Display name / প্রদর্শিত নাম</label><input class="input" [(ngModel)]="displayName" name="displayName" />
    <label class="label">New password (optional) / নতুন পাসওয়ার্ড (ঐচ্ছিক)</label><input class="input" type="password" [(ngModel)]="newPassword" name="newPassword" />
    <jc-button variant="outline" label="Email me a verification code / ইমেইলে কোড পাঠান" [fullWidth]="true" (clicked)="sendCode()" />
    <label class="label">Verification code / যাচাইকরণ কোড</label><input class="input" inputmode="numeric" maxlength="6" [(ngModel)]="code" name="code" />
    <jc-button variant="primary" label="Save verified changes / যাচাই করে সংরক্ষণ করুন" [fullWidth]="true" (clicked)="save()" />
  </div></jc-card></div>`
})
export class ProfileComponent {
  auth = inject(AuthService); displayName = this.auth.user()?.displayName ?? ''; newPassword = ''; code = ''; message = signal(''); error = signal('');
  sendCode(): void { this.error.set(''); this.auth.requestCredentialChangeCode().subscribe({ next: r => this.message.set(r.message), error: e => this.error.set(e?.error?.error || 'Unable to send code.') }); }
  save(): void { this.error.set(''); this.auth.changeCredentials(this.code.trim(), this.displayName, this.newPassword || undefined).subscribe({ next: r => { this.message.set(r.message); this.newPassword = ''; this.code = ''; }, error: e => this.error.set(e?.error?.error || 'Unable to update credentials.') }); }
}
