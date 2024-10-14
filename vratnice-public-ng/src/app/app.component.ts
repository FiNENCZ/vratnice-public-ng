import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'vratnice-public-ng';

  constructor(
    private readonly translateService: TranslateService,
    private readonly primeNGConfig: PrimeNGConfig,
  ) {
  }
 
  ngOnInit() {
    this.changeLanguage("cs") 
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
