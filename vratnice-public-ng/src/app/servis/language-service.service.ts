import { Injectable, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { VozidloTypDto, VozidloTypControllerService, StatDto, StatControllerService } from 'build/openapi';
import { ReCaptchaV3Service } from 'ng-recaptcha';
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
    private readonly recaptchaService: ReCaptchaV3Service,
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
    this.recaptchaService.execute('save').subscribe((token) => {
      this.vozidloTypControllerService.listVozidloTyp(token, false, this.translateService.currentLang).subscribe(
        response => {
          this.vozidloTypValuesSubject.next(response);
        }
      );
    })

    this.recaptchaService.execute('save').subscribe((token) => {
      this.statControllerService.listStat(token, this.translateService.currentLang).subscribe(
        response => {
          this.statValuesSubject.next(response);
        }
      )
    })
  }

}
