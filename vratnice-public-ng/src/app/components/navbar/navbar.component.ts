import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [TranslateModule, AppComponent, CommonModule],
  providers: [TranslateService]
})
export class NavbarComponent {

  ukFlagPath: string = "assets/images/uk-flag.svg";
  czFlagPath: string = "assets/images/cz-flag.svg"
  currentFlagPath: string = this.ukFlagPath;

  constructor(
    private readonly translateService: TranslateService,
    private readonly appComponent: AppComponent
  ) {}

  changeLanguage() {
    if (this.appComponent.getCurrentLanguage() == "en"){
      this.appComponent.changeLanguage("cs");
      this.currentFlagPath = this.ukFlagPath;
    }
    else {
      this.appComponent.changeLanguage("en");
      this.currentFlagPath = this.czFlagPath;
    }
  }

}
