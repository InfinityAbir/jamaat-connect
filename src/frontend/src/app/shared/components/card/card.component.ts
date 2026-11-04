import { Component, input, contentChildren, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jc-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card app-card" [class]="customClass()">
      @if (hasHeader()) {
        <div class="card-header">
          <ng-content select="[slot=header]"></ng-content>
        </div>
      }
      <div class="card-body" [class]="bodyClass()">
        <ng-content></ng-content>
      </div>
      @if (hasFooter()) {
        <div class="card-footer">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `
})
export class CardComponent {
  customClass = input('');
  bodyClass = input('');
  hasHeader = input(false);
  hasFooter = input(false);
}
