import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';

import { DialogModule } from "primeng/dialog"
import { MessageModule } from "primeng/message"
import { MultiSelectModule } from "primeng/multiselect"
import { CheckboxModule } from "primeng/checkbox"
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable, of, Subject, debounceTime, distinctUntilChanged, switchMap, catchError, BehaviorSubject, map, Subscription, concatMap } from 'rxjs';
import { PovoleniVjezduVozidlaDto } from '../../../../build/openapi/model/povoleniVjezduVozidlaDto';
import { RidicDto } from '../../../../build/openapi/model/ridicDto';
import { StatDto } from '../../../../build/openapi/model/statDto';
import { VozidloTypDto } from '../../../../build/openapi/model/vozidloTypDto';
import { ZavodDto } from '../../../../build/openapi/model/zavodDto';
//import { UiService } from '../../shared/services/ui.service';
import { newPovoleniVjezduVozidlaDto } from '../../functions/povoleniVjezduVozidla.dto.function ';
import { newRidicDto } from '../../functions/ridic.dto.function';
import { TranslateModule, TranslateLoader, TranslateService } from "@ngx-translate/core";
import { ZavodControllerService, RidicControllerService, VozidloTypControllerService, StatControllerService, PovoleniVjezduVozidlaControllerService, RzTypVozidlaDto, LokalitaDto, LokalitaControllerService, SpolecnostControllerService, SpolecnostDto } from '../../../../build/openapi';
import moment from 'moment';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpBackend, HttpClient, HttpClientModule } from '@angular/common/http';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import * as packageJson_ from 'package.json';
import localeCs from '@angular/common/locales/cs';
import { errorTxtFunction } from 'src/app/functions/error-txt.function';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarComponent } from 'src/app/shared/components/calendar/calendar-standalone.component';
import { DropdownComponent } from 'src/app/shared/components/dropdown/dropdown.component';
import { DetailPovoleniVjezduVozidlaCsvPage } from '../detail-povoleni-vjezdu-vozidla-csv/detail-povoleni-vjezdu-vozidla-csv.page';
import { DetailPovoleniVjezduVozidlaTypRzCsvPage } from '../detail-povoleni-vjezdu-vozidla-typ-rz-csv/detail-povoleni-vjezdu-vozidla-typ-rz-csv.page';
import { getErrorMessage } from 'src/app/functions/get-error-message.function';
import { LanguageService } from 'src/app/servis/language-service.service';
import { transformSpolecnostFunction } from 'src/app/functions/transformSpolecnost.function';
import { ReCaptchaV3Service } from 'ng-recaptcha';


@Component({
  selector: 'app-povoleni-vjezdu-vozidla',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule, 
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    MultiSelectModule, 
    TranslateModule,
    CheckboxModule, 
    MessageModule,
    CalendarComponent,
    DropdownComponent,
    AutoCompleteModule,
    ToastModule,
    DetailPovoleniVjezduVozidlaCsvPage,
    DetailPovoleniVjezduVozidlaTypRzCsvPage],
  providers: [ConfirmationService, TranslateService],
  templateUrl: './povoleni-vjezdu-vozidla.component.html',
  styleUrl: './povoleni-vjezdu-vozidla.component.css'
})
export class PovoleniVjezduVozidlaComponent {
  @Input() refreshSeznamToken$: BehaviorSubject<undefined> | undefined = undefined;
  @ViewChild('formDetail') public formDetail: NgForm | undefined;
  @ViewChild('inputImportCSV') inputImportCSV?: ElementRef;
  @ViewChild(DetailPovoleniVjezduVozidlaCsvPage) detailPovoleniVjezduVozidlaCsvPage?: DetailPovoleniVjezduVozidlaCsvPage;
  @ViewChild(DetailPovoleniVjezduVozidlaTypRzCsvPage) detailPovoleniVjezduVozidlaTypRzCsvPage?: DetailPovoleniVjezduVozidlaTypRzCsvPage;

  detail?: PovoleniVjezduVozidlaDto = newPovoleniVjezduVozidlaDto();
  idZaznamu?: string;
  aktivita: boolean = true;
  isRidicRequired: boolean = false;
  lokalitaList: LokalitaDto[] = [];

  showCsvInfoDialog = false;
  infoDialogTimeout: any;

  private searchTerms = new Subject<string>();

  vozidloTyp$: Observable<VozidloTypDto[] | null>;
  private vozidloTypSubscription?: Subscription;

  stat$: Observable<StatDto[] | null>;
  private statSubscription?: Subscription;

  spolecnostList: SpolecnostDto[] = [];
  filtrovaneSpolecnosti?: SpolecnostDto[];

  constructor(
    //private readonly confirmationService: ConfirmationService,
    private readonly elementRef: ElementRef,
    private messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    //private readonly uiService: UiService,
    
    private readonly povoleniVjezduVozidlaControllerService: PovoleniVjezduVozidlaControllerService,
    private readonly zavodControllerService: ZavodControllerService,
    private readonly ridicControllerService: RidicControllerService,
    private readonly vozidlotypControllerService: VozidloTypControllerService,
    private readonly statControllerService: StatControllerService,
    private readonly languageService: LanguageService,
    private readonly lokalitaControllerService: LokalitaControllerService,
    private readonly spolecnostControllerService: SpolecnostControllerService,
    private readonly recaptchaService: ReCaptchaV3Service,
    
  ) {
    this.vozidloTyp$ = this.languageService.vozidloTypValuesObservable;
    this.stat$ = this.languageService.statValuesObservable;
  }

  ngOnInit() {
    this.showNovyDetail()

    this.vozidloTypSubscription = this.vozidloTyp$.subscribe(data => {
      console.log('Updated vozidloTyp values:', data);
    });

    this.statSubscription = this.stat$.subscribe(data => {
      console.log('Updated stat values:', data);
    });

    this.recaptchaService.execute('save').subscribe((token) => {
      this.spolecnostControllerService.listSpolecnost(token).subscribe(
        response => {
          this.spolecnostList = response;
        }
      );
    });


    this.searchTerms.pipe(
      debounceTime(1000), // Odložení vyhledávání o 1 sekundu
      distinctUntilChanged(), // Spustit pouze při změně hodnoty
      switchMap((cisloOp: string) => 
        this.recaptchaService.execute('save').pipe(
          switchMap((token) => 
            this.ridicControllerService.getRidicByCisloOpRidic(cisloOp, token, this.translateService.currentLang).pipe(
              catchError((error) => {
                console.error('Řidič nenalezen:', error);
                return of(null); // Vraťte null nebo jiný vhodný výstup pro pokračování procesu
              })
            )
          )
        )
      )
    ).subscribe({
      next: (ridic: RidicDto | null) => {
        if (ridic) {
          this.detail!.ridic = ridic;
          this.messageService.add({ severity: 'success', detail: this.translateService.instant('POVOLENI_VJEZDU_VOZIDLA.RIDIC_NACTEN'), closable: false });
        }
      },
      error: (error) => {
        console.error('Chyba při vyhledávání řidiče:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchTerms.complete();
    this.vozidloTypSubscription!.unsubscribe();
    this.statSubscription!.unsubscribe();
  }

  searchSpolecnost(event: any) {
    this.filtrovaneSpolecnosti = this.spolecnostList.filter(spolecnost => spolecnost.nazev.toLowerCase().includes(event.query.toLowerCase()));
  }



 

  showNovyDetail() {
    this.novyDetail();
    this.idZaznamu = undefined;
  }

  novyDetail() {
    this.formDetail?.form.markAsPristine();
    this.detail = newPovoleniVjezduVozidlaDto();
    this.pridatVstup();
  }

  ulozit(form: NgForm) {
    if (form.pending) {
      return;
    }
    if (form.invalid) {
      Object.keys(form.control.controls).forEach(field => {
        const control = form.control.get(field);
        control?.markAsDirty({ onlySelf: true });
      });
      return;
    }

    // Zkontrolovat jestli je Ridic prázdný objekt, pokud ano, tak ho vymazat
    if (this.detail?.ridic && this.isObjectEmpty(this.detail.ridic)) {
      delete this.detail.ridic;
    }

    this.detail = transformSpolecnostFunction(this.detail);

 

    this.recaptchaService.execute('save').subscribe((token) => {
      this.povoleniVjezduVozidlaControllerService.savePovoleniVjezduVozidla(token!, this.detail!, this.translateService.currentLang)
      .subscribe({
        next: (vysledek: PovoleniVjezduVozidlaDto) => {
          //this.uiService.stopSpinner();
          this.messageService.add({ severity: 'success', detail: this.translateService.instant('POVOLENI_VJEZDU_VOZIDLA.ZADOST_PODANA'), closable: false });
          this.novyDetail();
          this.formDetail?.form.markAsPristine();
          this.refreshSeznamToken$?.next(undefined);
        },
        error: error => {
          //this.uiService.stopSpinner();
          console.log(error);
          console.log(error.error);
          this.messageService.add({ severity: 'error', detail: getErrorMessage(error), closable: false });
        }
      });
    });
  }


  pridatVstup() {
    this.detail!.rzVozidla.push('');
  }

  odstranitVstup(index: number) {
    this.detail!.rzVozidla.splice(index, 1);
    this.detail!.typVozidla.splice(index, 1);
  }

  trackByFn(index: number, item: any) {
    return index; // or item.id
  }

  addRidic() {
    this.detail!.ridic = newRidicDto();
  }

  private isObjectEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  smazatRidice() {
    delete this.detail!.ridic;
  }

  private readonly zavodValuesSubject = new BehaviorSubject<ZavodDto[] | any>(undefined);
  protected nacitaniDatZavodu: boolean = true;
  protected zavodyValuesObservable$: Observable<ZavodDto[] | any> = new BehaviorSubject(undefined).pipe(
    switchMap(() => {
      if (this.zavodValuesSubject.getValue() !== undefined) {
        return this.zavodValuesSubject.asObservable();
      } else {
        this.nacitaniDatZavodu = true;
        return this.recaptchaService.execute('save').pipe(
          concatMap((token) => {
            return this.zavodControllerService.listZavod(token, this.aktivita, this.translateService.currentLang).pipe(
              map((value) => {
                this.nacitaniDatZavodu = false;
                this.zavodValuesSubject.next(value);
                return value;
              }),
              catchError(error => {
                this.nacitaniDatZavodu = false;
                this.messageService.add({ severity: 'error', detail: getErrorMessage(error), closable: false });
                return of(undefined);
              })
            );
          })
        );
      }
    })
  ).pipe(
    map((response: ZavodDto[]) => {
      if (response && response.length > 0) {
        if (!this.detail?.zavod) {
          this.detail!.zavod = response[0];
          this.getLokalitaList(response[0].id!.toString());
          //this.getBudovaValuesObservable(this.detail?.lokalita?.id!);
        }

        this.changeDetectorRef.detectChanges();
      }
      return response;
    })
  );

  getLokalitaList(idZavod: string) {
    this.recaptchaService.execute('save').subscribe((token) => {
      this.lokalitaControllerService.listLokalita(token, idZavod).subscribe(
        response => {
          this.lokalitaList = response;
        }
      )
    });
  }

  showCsvInfo() {
    this.showCsvInfoDialog = true;
  }

  fillInRidicByCisloOp(cisloOp: string) {
    this.searchTerms.next(cisloOp);
  }

  private nastavDatumy() {
    this.detail!.datumOd = moment(this.detail?.datumOd).toDate();
    this.detail!.datumDo = moment(this.detail?.datumDo).toDate();
  }

  nacitaniDatVozidloTyp: boolean = true;
  private readonly vozidloTypValuesSubject = new BehaviorSubject<VozidloTypDto[] | any>(null);
  vozidloTypValuesObservable: Observable<VozidloTypDto[] | any> = new BehaviorSubject(undefined).pipe(
      switchMap(() => {
          if (this.vozidloTypValuesSubject.getValue() !== null) {
              return this.vozidloTypValuesSubject.asObservable();
          } else {
              this.nacitaniDatVozidloTyp = true;
              return this.recaptchaService.execute('save').pipe(
                concatMap((token) => {
                return this.vozidlotypControllerService.listVozidloTyp(token, false, this.translateService.currentLang).pipe(
                    map(response => {
                        this.nacitaniDatVozidloTyp = false;
                        this.vozidloTypValuesSubject.next(response);
                        return response;
                    })
                );
              })
            )
          }
      })
  );

  nacitaniDatStat: boolean = true;
  private readonly StatValuesSubject = new BehaviorSubject<StatDto[] | any>(null);
  statValuesObservable: Observable<StatDto[] | any> = new BehaviorSubject(undefined).pipe(
      switchMap(() => {
          if (this.StatValuesSubject.getValue() !== null) {
              return this.StatValuesSubject.asObservable();
          } else {
              this.nacitaniDatStat = true;
              return this.recaptchaService.execute('save').pipe(
                concatMap((token) => {
                  return this.statControllerService.listStat(token, this.translateService.currentLang).pipe(
                      map(response => {
                          this.nacitaniDatStat = false;
                          this.StatValuesSubject.next(response);
                          return response;
                      })
                  );
                })
               ) 
          }
      })
  );


  protected nastavPlatnost(zmenadatumOd: boolean) {
    if (!this.detail?.datumOd && !this.detail?.datumDo) {
      return;
    } else if (this.detail?.datumOd && !this.detail?.datumDo) {
      this.detail.datumDo = this.detail?.datumOd;
    } else if (!this.detail?.datumOd && this.detail?.datumDo) {
      this.detail.datumOd = this.detail?.datumDo;
    } else if (this.detail!.datumOd! > this.detail!.datumDo!) {
      if (zmenadatumOd) {
        this.detail.datumDo = this.detail?.datumOd;
      } else {
        this.detail.datumOd = this.detail?.datumDo;
      }
    }
  }

  public printZavodList() {
    console.log(this.lokalitaList);
  }

  showPovoleniVjezduVozidlaCsvDetail() {
    this.detailPovoleniVjezduVozidlaCsvPage?.showNovyDetail();
  }

  importRzTypVozidlaFromDialog(rzTypVozidla: any) {
    this.detail!.rzVozidla = rzTypVozidla.rzVozidla;
    this.detail!.typVozidla = rzTypVozidla.typVozidla;
    
    this.detailPovoleniVjezduVozidlaTypRzCsvPage?.zavritDetail();
  }

  showTypRzVozidlaCsvDetail() {
    this.detailPovoleniVjezduVozidlaTypRzCsvPage?.showNovyDetail();
  }

}
