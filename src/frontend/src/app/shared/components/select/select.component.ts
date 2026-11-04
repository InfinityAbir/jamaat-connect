import { CommonModule } from '@angular/common';
import { Component, signal, computed, EventEmitter, Output, Input, HostListener } from '@angular/core';
import { TranslatePipe } from '@app/shared/pipes/translate.pipe';

export interface SelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'jc-select',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="jc-select" [class.open]="isOpen()" (click)="toggle()">
      <div class="jc-select__trigger">
        <span class="jc-select__value" [class.placeholder]="!selectedLabel()">
          {{ selectedLabel() }}
        </span>
        <svg class="jc-select__chevron" [class.rotated]="isOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      @if (isOpen()) {
        <div class="jc-select__dropdown" (click)="$event.stopPropagation()">
          @for (opt of options; track opt.value) {
            <div
              class="jc-select__option"
              [class.active]="opt.value === value"
              (click)="selectOption(opt.value)"
            >
              {{ opt.label }}
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .jc-select {
      position: relative;
      display: inline-block;
      width: 100%;
    }
    .jc-select__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      border: 1px solid #e7e5df;
      background: #fff;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      color: #1f2937;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .jc-select__trigger:hover {
      border-color: #10b981;
    }
    .jc-select.open .jc-select__trigger {
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    .jc-select__value {
      color: #1f2937;
    }
    .jc-select__value.placeholder {
      color: #9ca3af;
    }
    .jc-select__chevron {
      width: 1rem;
      height: 1rem;
      color: #6b7280;
      transition: transform 0.2s;
      flex-shrink: 0;
      margin-left: 0.5rem;
    }
    .jc-select__chevron.rotated {
      transform: rotate(180deg);
    }
    .jc-select__dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #e7e5df;
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      z-index: 50;
      max-height: 16rem;
      overflow-y: auto;
      padding: 0.25rem;
    }
    .jc-select__option {
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      color: #1f2937;
      cursor: pointer;
      transition: background 0.15s;
    }
    .jc-select__option:hover {
      background: #ecfdf5;
    }
    .jc-select__option.active {
      background: #10b981;
      color: #fff;
    }
  `]
})
export class SelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() value: any = '';
  @Output() valueChange = new EventEmitter<any>();

  private _isOpen = signal(false);

  readonly isOpen = this._isOpen.asReadonly();

  readonly selectedLabel = computed(() => {
    const opt = this.options.find(o => o.value === this.value);
    return opt ? opt.label : '';
  });

  toggle(): void {
    this._isOpen.update(v => !v);
  }

  selectOption(val: any): void {
    this.value = val;
    this.valueChange.emit(val);
    this._isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this._isOpen()) {
      this._isOpen.set(false);
    }
  }
}
