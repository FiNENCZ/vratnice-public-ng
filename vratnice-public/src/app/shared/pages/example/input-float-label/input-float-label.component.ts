import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-input-float-label',
  templateUrl: './input-float-label.component.html',
  standalone: true,
  imports: [FormsModule, InputTextModule],
  styleUrls: []
})

export class InputFloatLabelComponent {
  value?: string;

  constructor(
  ) {
  }

}
