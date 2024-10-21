import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  standalone: true,
  imports: [ProgressSpinnerModule],
  template: `
  <div class="text-center">
    <p-progressSpinner [style]="{width: '60px', height: '60px'}" strokeWidth="4"></p-progressSpinner>
    <div class="fw-bold spinner-nadpis text-black "></div>
    <div class="spinner-message text-black"></div>
  </div>`,
})

export class SpinnerComponent {
}
