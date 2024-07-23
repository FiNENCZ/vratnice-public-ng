import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import { DialogModule } from "primeng/dialog"
import { MessageModule } from "primeng/message"
import { MultiSelectModule } from "primeng/multiselect"
import { CheckboxModule } from "primeng/checkbox"
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable, of, Subject, debounceTime, distinctUntilChanged, switchMap, catchError, BehaviorSubject, map } from 'rxjs';
import { PovoleniVjezduVozidlaDto } from '../../../../build/openapi/model/povoleniVjezduVozidlaDto';
import { RidicDto } from '../../../../build/openapi/model/ridicDto';
import { StatDto } from '../../../../build/openapi/model/statDto';
import { VozidloTypDto } from '../../../../build/openapi/model/vozidloTypDto';
import { ZavodDto } from '../../../../build/openapi/model/zavodDto';
//import { UiService } from '../../shared/services/ui.service';
import { newPovoleniVjezduVozidlaDto } from '../../functions/povoleniVjezduVozidla.dto.function ';
import { newRidicDto } from '../../functions/ridic.dto.function';
import { TranslateModule, TranslateLoader, TranslateService } from "@ngx-translate/core";
import { ZavodControllerService, RidicControllerService, VozidloTypControllerService, StatControllerService, PovoleniVjezduVozidlaControllerService, RzTypVozidlaDto } from '../../../../build/openapi';
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
import { CalendarComponent } from 'src/app/shared/components/calendar/calendar-standalone.component';
import { DropdownComponent } from 'src/app/shared/components/dropdown/dropdown.component';
import { DetailPovoleniVjezduVozidlaCsvPage } from '../detail-povoleni-vjezdu-vozidla-csv/detail-povoleni-vjezdu-vozidla-csv.page';
import { DetailPovoleniVjezduVozidlaTypRzCsvPage } from '../detail-povoleni-vjezdu-vozidla-typ-rz-csv/detail-povoleni-vjezdu-vozidla-typ-rz-csv.page';


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
  zavodList: ZavodDto[] = [];
  vozidloTyp$: Observable<any[]>  = of([]);

  // Pomocné proměnné pro dvoucestnou vazbu
  ridicId?: string;
  ridicJmeno?: string;
  ridicPrijmeni?: string;
  ridicFirma?: string;
  ridicCisloOp?: string;

  showCsvInfoDialog = false;
  infoDialogTimeout: any;

  private searchTerms = new Subject<string>();

  constructor(
    //private readonly confirmationService: ConfirmationService,
    private readonly elementRef: ElementRef,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    //private readonly uiService: UiService,
    
    private readonly povoleniVjezduVozidlaControllerService: PovoleniVjezduVozidlaControllerService,
    private readonly zavodControllerService: ZavodControllerService,
    private readonly ridicControllerService: RidicControllerService,
    private readonly vozidlotypControllerService: VozidloTypControllerService,
    private readonly statControllerService: StatControllerService,
  ) {
  }

  ngOnInit() {
    this.showNovyDetail()
    this.initializeRidicValues();

    this.zavodControllerService.listZavod(true).subscribe(
      response => {
        this.zavodList = response;
      }
    );

    const vozidloTyp = ['osobní', 'dodávka', 'nákladní', 'speciální'];
    this.vozidloTyp$ = of(vozidloTyp);

    
    this.searchTerms.pipe(
      debounceTime(1000), // Odložení vyhledávání o 1 sekundu
      distinctUntilChanged(), // Spustit pouze při změně hodnoty
      switchMap((cisloOp: string) => 
        this.ridicControllerService.getRidicByCisloOpRidic(cisloOp).pipe(
          catchError((error) => {
            console.error('Řidič nenalezen:', error);
            return of(null); // Vraťte null nebo jiný vhodný výstup pro pokračování procesu
          })
        )
      )
    ).subscribe({
      next: (ridic: RidicDto | null) => {
        if (ridic) {
          this.detail!.ridic = ridic;
          this.initializeRidicValues();
          this.messageService.add({ severity: 'success', summary: 'Řidič byl načten z databáze dle čísla OP.' });
        }
      },
      error: (error) => {
        console.error('Chyba při vyhledávání řidiče:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchTerms.complete();
  }

  initializeRidicValues() {
    this.ridicId = this.detail?.ridic?.idRidic;
    this.ridicJmeno = this.detail?.ridic?.jmeno;
    this.ridicPrijmeni = this.detail?.ridic?.prijmeni;
    this.ridicFirma = this.detail?.ridic?.firma;
    this.ridicCisloOp = this.detail?.ridic?.cisloOp;

    if (this.detail?.ridic) {
      // pokud je ridic prázdný objekt, tak ho vymazat (nenačítat)
      if (this.detail?.ridic && this.isObjectEmpty(this.detail.ridic)) {
        delete this.detail.ridic;
        return;
      }
      this.isRidicRequired = true;
    } else {
      this.isRidicRequired = false;
    }
  }

  updateRidicValues() {
    if (this.ridicJmeno && this.ridicPrijmeni && this.ridicCisloOp) {
      const ridic = newRidicDto();

      ridic.idRidic = this.ridicId;
      ridic.jmeno = this.ridicJmeno || '';
      ridic.prijmeni = this.ridicPrijmeni || '';
      ridic.firma = this.ridicFirma;
      ridic.cisloOp = this.ridicCisloOp || '';

      this.detail!.ridic = ridic;
    }
  }

  showNovyDetail() {
    this.novyDetail();
    this.idZaznamu = undefined;
  }

  novyDetail() {
    this.formDetail?.form.markAsPristine();
    this.detail = newPovoleniVjezduVozidlaDto();
    this.isRidicRequired = false;
    this.initializeRidicValues();
    this.pridatVstup();
  }

  ulozit(form: NgForm) {
    this.messageService.add({ severity: 'error', summary: "test", detail: "Success Service Message"});
    
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

    this.updateRidicValues();

    // Zkontrolovat jestli je Ridic prázdný objekt, pokud ano, tak ho vymazat
    if (this.detail?.ridic && this.isObjectEmpty(this.detail.ridic)) {
      delete this.detail.ridic;
    }

    console.log(this.detail);

    this.povoleniVjezduVozidlaControllerService.savePovoleniVjezduVozidla(this.detail!)
      .subscribe({
        next: (vysledek: PovoleniVjezduVozidlaDto) => {
          //this.uiService.stopSpinner();
          console.log(vysledek)
          this.formDetail?.form.markAsPristine();
          this.refreshSeznamToken$?.next(undefined);
        },
        error: error => {
          //this.uiService.stopSpinner();
          console.log(error);
          console.log(error.error);
          this.messageService.add({ severity: 'error', summary: this.getErrorMessage(error) });
        }
      });
  }

  private zavodSubject = new BehaviorSubject<ZavodDto[] | undefined>(undefined);
  nacitaniZavodu: boolean = true;

  zavod$: Observable<ZavodDto[] | undefined> = new BehaviorSubject(undefined).pipe(
    switchMap(() => {
      if (this.zavodSubject.getValue() !== undefined) {
        return this.zavodSubject.asObservable();
      } else {
        this.nacitaniZavodu = true;
        return this.zavodControllerService.listZavod(this.aktivita, "cs").pipe(
          map((value) => {
            this.nacitaniZavodu = false;
            //this.uiService.stopSpinner();
            this.zavodSubject.next(value);
            return value;
          }),
          catchError(
            error => {
              this.messageService.add({ severity: 'error', summary: this.getErrorMessage(error) });
              //this.uiService.stopSpinner();
              return of(undefined);
            }
          )
        );
      }
    })
  );


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

  toggleRidicRequired() {
    this.isRidicRequired = !this.isRidicRequired;
  }

  private isObjectEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  smazatRidice() {
    this.ridicId = undefined;
    this.ridicJmeno = undefined;
    this.ridicPrijmeni = undefined;
    this.ridicFirma = undefined;
    this.ridicCisloOp = undefined;

    delete this.detail?.ridic;

    this.toggleRidicRequired();
  }

  onCsvSelected(event: any): void {
    //this.uiService.showSpinner();
    const file: File = event.target.files[0];
    if (file) {
      this.povoleniVjezduVozidlaControllerService.rzTypVozidlaCsvPovoleniVjezduVozidla(file)
      .subscribe(
          (response: RzTypVozidlaDto) => {
            //this.uiService.stopSpinner();
            this.messageService.add({ severity: 'success', summary: 'Vozidla byla úspěšně načtena' });

            this.detail!.rzVozidla = response.rzVozidla;
            this.detail!.typVozidla = response.typVozidla;

            console.log(response);
          },
          error => {
            //this.uiService.stopSpinner();
            this.messageService.add({ severity: 'error', summary: this.getErrorMessage(error) });
          }
      );
    }

    if (this.inputImportCSV) {
      this.inputImportCSV.nativeElement.value = '';
    }

  }

  importCSV() {
    document.getElementById('inputImportCSV')?.click();
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
              return this.vozidlotypControllerService.listVozidloTyp(false ,"cs").pipe(
                  map(response => {
                      this.nacitaniDatVozidloTyp = false;
                      this.vozidloTypValuesSubject.next(response);
                      return response;
                  })
              );
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
              return this.statControllerService.listStat("cs").pipe(
                  map(response => {
                      this.nacitaniDatStat = false;
                      this.StatValuesSubject.next(response);
                      return response;
                  })
              );
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
    console.log(this.zavodList);
  }

  private getErrorMessage(error: any): string{
    const keys = Object.keys(error.error);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const value = error.error[firstKey];
      return value
    } else {
      return "Vznikla nezmapovaná chyba na serveru. Akci opakujte později."
    }
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
