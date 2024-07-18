import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BreadcrumbDto } from 'src/app/shared/dto/breadcrumb.dto';
import { BreadcrumbTypVlozeniEnum } from 'src/app/shared/enums/breadcrumb-typ-vlozeni.enum';
import { SeznamBaseClass } from 'src/app/shared/pages/base/seznam-base.class';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { UiService } from 'src/app/shared/services/ui.service';
import { SeznamTypeColumnEnum } from 'src/app/shared/enums/seznam-type-column.enum';
import { AuthService } from 'src/app/shared/services/auth.service';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { DetailZastupPage } from '../detail-zastup/detail-zastup.page';
import { ZastupControllerService, ZastupDto } from 'build/openapi';

@Component({
  selector: 'app-seznam-zastup',
  templateUrl: './seznam-zastup.page.html'
})

export class SeznamZastupPage extends SeznamBaseClass implements OnInit {
  @ViewChild(DetailZastupPage) detailZastupPage?: DetailZastupPage;
  protected zastupy$?: Observable<ZastupDto[] | undefined>;
  private zastupyPom$?: Observable<ZastupDto[] | undefined>;
  protected aktivita: boolean = true;
  protected filtrPlatnostOd?: Date;
  protected filtrPlatnostDo?: Date;
  private posleniFiltrPlatnostOd?: Date;
  private posleniFiltrPlatnostDo?: Date;
  protected globalFilterFields?: string[];

  constructor(
    private readonly uiService: UiService,
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly confirmationService: ConfirmationService,
    private readonly translateService: TranslateService,
    private readonly zastupControllerService: ZastupControllerService,
    private readonly breadcrumbService: BreadcrumbService
  ) {
    super();
    this.breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto("ZASTUPY.NAZEV_SEZNAM", true, window.location.hash));
  }

  protected roleSpravaZastupuSynchronizace(): boolean {
    return this.authService.maUzivatelRole(['ROLE_SPRAVA_ZASTUPU_SYNCHRONIZACE']);
  }

  synchronizaceZastupu() {
    this.translateService.get('ZASTUPY.DOTAZ_SYNCHRONIZACE').subscribe((resDotaz: string) => {
      this.confirmationService.confirm({
        message: resDotaz,
        accept: () => {
          this.uiService.showSpinner();
          this.zastupControllerService.synchronizaceZastup(this.translateService.currentLang).subscribe({
            next: () => {
              this.uiService.stopSpinner();
              this.translateService.get('ZASTUPY.SYNCHRONIZACE_DOKONCENA').subscribe((resVysledek: string) => {
                this.messageService.add({ severity: 'success', summary: resVysledek });
              });
              this.refreshSeznam();
            },
            error: (error) => {
              this.uiService.stopSpinner();
              this.refreshSeznam();
              this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
            }
          });
        },
        reject: () => {
        }
      });
    });
  }

  protected showNovyDetail() {
    this.detailZastupPage?.showNovyDetail();
  }

  protected showDetailDialog(zastupDto: ZastupDto) {
    this.detailZastupPage?.showDetailDialog(zastupDto);
  }

  protected zmenaNacistAktivita() {
    this.aktivita = !this.aktivita;
    this.breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto(this.aktivita ? "ZASTUPY.NAZEV_SEZNAM" : "ZASTUPY.NAZEV_SEZNAM_ODSTRANENE", true, window.location.hash));
    this.refreshSeznam();
  }

  protected nastavPlatnost(zmenaPlatnostOd: boolean) {
    if (this.filtrPlatnostOd && this.filtrPlatnostDo && this.filtrPlatnostOd > this.filtrPlatnostDo) {
      if (zmenaPlatnostOd) {
        this.filtrPlatnostDo = this.filtrPlatnostOd;
      } else {
        this.filtrPlatnostOd = this.filtrPlatnostDo;
      }
    }
    if (this.posleniFiltrPlatnostOd != this.filtrPlatnostOd || this.posleniFiltrPlatnostDo != this.filtrPlatnostDo) {
      this.posleniFiltrPlatnostOd = this.filtrPlatnostOd;
      this.posleniFiltrPlatnostDo = this.filtrPlatnostDo;
      this.refreshSeznam();
    }
  }

  private refreshSeznam() {
    this.zastupy$ = undefined;
    setTimeout(() => {
      this.refreshToken$.next(undefined);
      this.zastupy$ = this.zastupyPom$;
    }, 10);
  }

  vychoziNastaveniSloupcu() {
    this.cols = [
      { field: 'uzivatel.sapId', header: 'ZASTUPY.ZASTUPOVANY', idColTemplates: 0, width: '300px', defaultVisible: true },
      { field: 'uzivatelZastupce.sapId', header: 'ZASTUPY.ZASTUPCE', idColTemplates: 1, width: '300px', defaultVisible: true },
      { field: 'platnostOd', header: 'ZASTUPY.PLATNOST_OD', typeColumn: SeznamTypeColumnEnum.Datum, width: '120px', defaultVisible: true },
      { field: 'platnostDo', header: 'ZASTUPY.PLATNOST_DO', typeColumn: SeznamTypeColumnEnum.Datum, width: '120px', defaultVisible: true },
      { field: 'distribuovano', header: 'ZASTUPY.DISTRIBUOVANO', typeColumn: SeznamTypeColumnEnum.Boolean, width: '140px', defaultVisible: true },
      { field: 'chybaDistribuce', header: 'ZASTUPY.CHYBA_DISTRIBUCE', width: '350px', styleField: "white-space-pre-wrap", defaultVisible: true }
    ];
    this.globalFilterFields = ["uzivatel.sapId", "uzivatel.nazev", "uzivatelZastupce.sapId", "uzivatelZastupce.nazev", "platnostOd", "platnostDo", "chybaDistribuce"];
  }

  ngOnInit(): void {
    var that = this;
    super.ngOnInit();

    this.zastupy$ = this.refreshToken$.pipe(
      switchMap(() => {
        return this.zastupControllerService.listZastup(this.filtrPlatnostOd ? (this.filtrPlatnostOd.toISOString() as any) : undefined, this.filtrPlatnostDo ? (this.filtrPlatnostDo.toISOString() as any) : undefined, undefined, undefined, this.aktivita, this.translateService.currentLang).pipe(
          map((value) => {
            that.uiService.stopSpinner();
            return value;
          }),
          catchError(
            error => {
              this.messageService.add({ severity: 'error', summary: error.error.message ? error.error.message : error.message });
              return of(undefined);
            }
          )
        );
      })
    );
    this.zastupyPom$ = this.zastupy$;
  }
}
