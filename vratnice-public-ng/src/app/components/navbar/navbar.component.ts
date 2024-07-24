import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
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
    private readonly primeNGConfig: PrimeNGConfig,
  ) {}

  toggleLanguage() {
    if (this.translateService.currentLang == "en"){
      this.changeLanguage("cs");
      this.currentFlagPath = this.ukFlagPath;
    }
    else {
      this.changeLanguage("en");
      this.currentFlagPath = this.czFlagPath;
    }
  }

  changeLanguage(language: string) {
    this.translateService.use(language)
    this.translateService.get('primeng').subscribe(
      (res: any) => {
        this.primeNGConfig.setTranslation(res);
      }
    );
  }

}
