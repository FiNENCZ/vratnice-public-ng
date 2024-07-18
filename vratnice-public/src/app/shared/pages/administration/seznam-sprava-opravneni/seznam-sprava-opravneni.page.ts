import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OpravneniControllerService, OpravneniPrehledDto, ZavodControllerService, ZavodDto } from 'build/openapi';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PolozkaMenuEnum } from 'src/app/enums/polozka-menu.enum';
import { SeznamComponent } from 'src/app/shared/components/seznam-component/seznam.component';
import { BreadcrumbDto } from 'src/app/shared/dto/breadcrumb.dto';
import { BreadcrumbTypVlozeniEnum } from 'src/app/shared/enums/breadcrumb-typ-vlozeni.enum';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { SeznamBaseClass } from 'src/app/shared/pages/base/seznam-base.class';
import { AuthService } from 'src/app/shared/services/auth.service';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { UiService } from 'src/app/shared/services/ui.service';
import { DetailSpravaOpravneniPage } from '../detail-sprava-opravneni/detail-sprava-opravneni.page';

@Component({
  selector: 'app-seznam-sprava-opravneni',
  templateUrl: './seznam-sprava-opravneni.page.html'
})

export class SeznamSpravaOpravneniPage extends SeznamBaseClass implements OnInit {
  @ViewChild(DetailSpravaOpravneniPage) detailSpravaOpravneniPage?: DetailSpravaOpravneniPage;
  @ViewChild(SeznamComponent) seznamComponent?: SeznamComponent;

  PolozkaMenuEnum = PolozkaMenuEnum;
  spravaOpravneni$?: Observable<OpravneniPrehledDto[] | undefined>;
  private spravaOpravneniPom$?: Observable<OpravneniPrehledDto[] | undefined>;
  aktivita: boolean = true;
  filtrZavod?: ZavodDto;

  sloupceGlobalFilterFields?: string[];

  constructor(
    private readonly uiService: UiService,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly zavodControllerService: ZavodControllerService,
    private readonly opravneniControllerService: OpravneniControllerService,
    private readonly breadcrumbService: BreadcrumbService
  ) {
    super();
    breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto("SPRAVA_OPRAVNENI.NAZEV_SEZNAM", true, window.location.hash));
  }

  private readonly zavodValuesSubject = new BehaviorSubject<ZavodDto[] | any>(undefined);
  nacitaniZavody: boolean = true;
  zavodValuesObservable: Observable<ZavodDto[] | any> = new BehaviorSubject(undefined).pipe(
    switchMap(() => {
      if (this.zavodValuesSubject.getValue() !== undefined) {
        return this.zavodValuesSubject.asObservable();
      } else {
        this.nacitaniZavody = true;
        return this.zavodControllerService.listZavod(true, this.translateService.currentLang).pipe(
          map(response => {
            this.nacitaniZavody = false;
            this.zavodValuesSubject.next(response);
            return response;
          }),
          catchError(
            error => {
              this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
              this.nacitaniZavody = false;
              return of(undefined);
            }
          )
        );
      }
    })
  );

  zmenaNacistAktivita() {
    this.aktivita = !this.aktivita;
    this.breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto(this.aktivita ? "SPRAVA_OPRAVNENI.NAZEV_SEZNAM" : "SPRAVA_OPRAVNENI.NAZEV_SEZNAM_ODSTRANENE", true, window.location.hash));
    this.refreshSeznam();
  }

  podminkaRadek(opravneniPrehledDto: OpravneniPrehledDto): string | null {
    return opravneniPrehledDto.aktivita ? null : "radek-neaktivni";
  }

  showNovyDetail() {
    this.detailSpravaOpravneniPage?.showNovyDetail();
  }

  showDetailDialog(opravneniPrehledDto: OpravneniPrehledDto) {
    this.detailSpravaOpravneniPage?.showDetailDialog({ id: opravneniPrehledDto.id } as any);
  }

  vychoziNastaveniSloupcu() {
    this.cols = [
      { field: 'kod', header: 'SPRAVA_OPRAVNENI.KOD', width: '200px', defaultVisible: true },
      { field: 'nazev', header: 'SPRAVA_OPRAVNENI.NAZEV', width: '400px', defaultVisible: true },
      { field: 'typPristupuKZamestnancum', header: 'SPRAVA_OPRAVNENI.PRISTUP_K_ZAMESTNANCUM', width: '250px', defaultVisible: true },
      { field: 'zavody', header: 'SPRAVA_OPRAVNENI.ZAVODY', width: '350px', styleField: "white-space-pre-wrap", defaultVisible: true, sortableOff: true },
      { field: 'zamestnanci', header: 'SPRAVA_OPRAVNENI.ZAMESTNANCI', width: '350px', styleField: "white-space-pre-wrap", defaultVisible: false, sortableOff: true }
    ];

    this.sloupceGlobalFilterFields = ['kod', 'nazev', 'typPristupuKZamestnancum', 'zavody', 'zamestnanci'];
  }

  filtrZavodOnChange(zavodDto: ZavodDto) {
    this.refreshSeznam();
  }

  filtrOnChange(event: any) {
    this.refreshSeznam();
  }

  private refreshSeznam() {
    this.spravaOpravneni$ = undefined;
    setTimeout(() => {
      this.refreshToken$.next(undefined);
      this.spravaOpravneni$ = this.spravaOpravneniPom$;
    }, 10);
  }

  ngOnInit(): void {
    var that = this;
    super.ngOnInit();

    this.spravaOpravneni$ = this.refreshToken$.pipe(
      switchMap(() => {
        return this.opravneniControllerService.prehledOpravneni(this.filtrZavod?.id, this.aktivita, this.translateService.currentLang).pipe(
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
    this.spravaOpravneniPom$ = this.spravaOpravneni$;
  }
}
