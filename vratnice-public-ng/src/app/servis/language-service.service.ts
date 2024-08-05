import { Injectable, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VozidloTypDto, VozidloTypControllerService, StatDto, StatControllerService } from 'build/openapi';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private vozidloTypValuesSubject = new BehaviorSubject<VozidloTypDto[] | null>(null);
  public vozidloTypValuesObservable: Observable<VozidloTypDto[] | null> = this.vozidloTypValuesSubject.asObservable();

  private statValuesSubject = new BehaviorSubject<StatDto[] | null>(null);
  public statValuesObservable: Observable<StatDto[] | null> = this.statValuesSubject.asObservable();

  constructor(
    public translateService: TranslateService,
    private vozidloTypControllerService: VozidloTypControllerService,
    private statControllerService: StatControllerService,
  ) {
    this.reloadCiselniky();
  }

  toggleLanguage() {
    const currentLang = this.translateService.currentLang;
    const newLang = currentLang === 'en' ? 'cs' : 'en';
    this.changeLanguage(newLang);
  }

  changeLanguage(language: string) {
    this.translateService.use(language).subscribe(() => {
      this.reloadCiselniky();
    });
  }



  private reloadCiselniky() {
    this.vozidloTypControllerService.listVozidloTyp(false, this.translateService.currentLang).subscribe(
      response => {
        this.vozidloTypValuesSubject.next(response);
      }
    );
    
    this.statControllerService.listStat(this.translateService.currentLang).subscribe(
      response => {
        this.statValuesSubject.next(response);
      }
    )
  }
}
