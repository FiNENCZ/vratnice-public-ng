import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { BreadcrumbDto } from 'src/app/shared/dto/breadcrumb.dto';
import { BreadcrumbTypVlozeniEnum } from 'src/app/shared/enums/breadcrumb-typ-vlozeni.enum';
import { SeznamTypeColumnEnum } from 'src/app/shared/enums/seznam-type-column.enum';
import { SeznamBaseClass } from 'src/app/shared/pages/base/seznam-base.class';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { UiService } from 'src/app/shared/services/ui.service';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { NgForm } from '@angular/forms';
import { DetailUzivatelPage } from '../detail-uzivatel/detail-uzivatel.page';
import { PracovniPoziceLogControllerService, PracovniPoziceLogDto, UzivatelControllerService, UzivatelDto } from 'build/openapi';

@Component({
  selector: 'app-seznam-uzivatel',
  templateUrl: './seznam-uzivatel.page.html'
  //styleUrls: ['./seznam-uzivatel.page.css']
})

export class SeznamUzivatelPage extends SeznamBaseClass implements OnInit {
  @ViewChild(DetailUzivatelPage) detailUzivatelPage?: DetailUzivatelPage;
  @ViewChild('formDetail') public formDetail?: NgForm;

  uzivatele$?: Observable<UzivatelDto[] | undefined>;
  private uzivatelePom$?: Observable<UzivatelDto[] | undefined>;

  aktivita: boolean = true;

  orgStrukturaVarovani: boolean = false;
  textVarovaniOrgStruktura: string = "UZIVATEL.ORG_STRUKTURA_NENI_AKTUALNI";

  constructor(
    private readonly uiService: UiService,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly uzivatelControllerService: UzivatelControllerService,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly pracovniPoziceLogControllerService: PracovniPoziceLogControllerService
  ) {
    super();
    breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto("UZIVATEL.NAZEV_SEZNAM", true, window.location.hash));

    this.pracovniPoziceLogControllerService.lastOkPracovniPoziceLog(this.translateService.currentLang).subscribe({
      next: (vysledek: PracovniPoziceLogDto) => {
        if (vysledek) {
          this.orgStrukturaVarovani = vysledek.varovani!;
          this.textVarovaniOrgStruktura = "UZIVATEL.ORG_STRUKTURA_NENI_AKTUALNI";
        } else {
          this.orgStrukturaVarovani = true;
          this.textVarovaniOrgStruktura = "UZIVATEL.NENALEZEN_ZAZNAM_LOGU_ORGANIZACNI_STRUKTURY";
        }
      }
    });
  }

  podminkaRadek(uzivatelDto: UzivatelDto): string | null {
    return uzivatelDto.aktivita ? null : "radek-neaktivni";
  }

  showNovyDetail() {
    this.detailUzivatelPage?.showNovyDetail();
  }

  showDetailDialog(uzivatelDto: UzivatelDto) {
    this.detailUzivatelPage?.showDetailDialog(uzivatelDto);
  }

  zmenaNacistAktivita() {
    this.aktivita = !this.aktivita;
    this.breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto(this.aktivita ? "UZIVATEL.NAZEV_SEZNAM" : "UZIVATEL.NAZEV_SEZNAM_ODSTRANENE", true, window.location.hash));
    this.refreshSeznam();
  }

  private refreshSeznam() {
    this.uzivatele$ = undefined;
    setTimeout(() => {
      this.refreshToken$.next(undefined);
      this.uzivatele$ = this.uzivatelePom$;
    }, 10);
  }

  vychoziNastaveniSloupcu() {
    this.cols = [
      // { field: 'id', header: 'UZIVATEL.ID', width: '150px', defaultVisible: true },
      { field: 'varovani', header: '', idColTemplates: 0, width: '50px', defaultVisible: true },
      { field: 'sapId', header: 'UZIVATEL.SAP_ID', width: '100px', defaultVisible: true },
      { field: 'nazev', header: 'UZIVATEL.NAZEV', width: '350px', defaultVisible: true },
      { field: 'rfid1', header: 'UZIVATEL.KARTA_1', width: '150px', defaultVisible: true },
      { field: 'rfid2', header: 'UZIVATEL.KARTA_2', width: '150px', defaultVisible: true },
      { field: 'zavod.nazev', header: 'UZIVATEL.ZAVOD', width: '150px', defaultVisible: true },
      { field: 'datumOd', header: 'UZIVATEL.DATUM_OD', typeColumn: SeznamTypeColumnEnum.Datum, width: '130px', defaultVisible: true },
      { field: 'datumDo', header: 'UZIVATEL.DATUM_DO', typeColumn: SeznamTypeColumnEnum.Datum, width: '130px', defaultVisible: true },
    ];
  }

  ngOnInit(): void {
    var that = this;
    super.ngOnInit();

    this.uzivatele$ = this.refreshToken$.pipe(
      switchMap(() => {
        return this.uzivatelControllerService.listUzivatel(this.aktivita, this.translateService.currentLang).pipe(
          map((value) => {
            that.uiService.stopSpinner();
            return value;
          }),
          catchError(
            error => {
              this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
              return of(undefined);
            }
          )
        );
      })
    );
    this.uzivatelePom$ = this.uzivatele$;
  }
}
