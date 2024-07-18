import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MessageModule} from "primeng/message"
import { DialogModule } from "primeng/dialog"
import { MultiSelectModule } from "primeng/multiselect"

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MessageModule, DialogModule, MultiSelectModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'vratnice-public';
}
