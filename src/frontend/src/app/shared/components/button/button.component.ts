import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

@Component({
  selector: 'jc-button',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink],
  template: `
    @if (routerLink()) {
      <a
        [routerLink]="routerLink()"
        [class]="buttonClass()"
        [class.disabled]="disabled() || loading()"
      >
        @if (loading()) {
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        } @else if (icon()) {
          <span [innerHTML]="icon()"></span>
        }
        <span>{{ label() | translate }}</span>
      </a>
    } @else {
      <button
        [type]="type()"
        [disabled]="disabled() || loading()"
        [class]="buttonClass()"
        (click)="onClick($event)"
      >
        @if (loading()) {
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        } @else if (icon()) {
          <span [innerHTML]="icon()"></span>
        }
        <span>{{ label() | translate }}</span>
      </button>
    }
  `
})
export class ButtonComponent {
  label = input.required<string>();
  variant = input<Variant>('primary');
  size = input<Size>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  loading = input(false);
  icon = input<string>('');
  fullWidth = input(false);
  routerLink = input<string | string[] | null>(null);

  clicked = output<MouseEvent>();

  buttonClass = computed(() => {
    const base = 'app-button inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants: Record<Variant, string> = {
      primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 focus-visible:ring-primary-500',
      secondary: 'bg-gold-600 text-white hover:bg-gold-700 active:bg-gold-800 focus-visible:ring-gold-500',
      outline: 'border-2 border-primary-700 text-primary-700 bg-transparent hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500',
      ghost: 'text-text-primary hover:bg-ivory-100 active:bg-ivory-200'
    };
    const sizes: Record<Size, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    const width = this.fullWidth() ? 'w-full' : '';

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${width}`;
  });

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
