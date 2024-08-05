import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { AppComponent } from 'src/app/app.component';
import { LanguageService } from 'src/app/servis/language-service.service';

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

  constructor(private languageService: LanguageService) {}

  toggleLanguage() {
    this.languageService.toggleLanguage();
    this.currentFlagPath = this.languageService.translateService.currentLang === 'en' ? this.czFlagPath : this.ukFlagPath;
  }

}
