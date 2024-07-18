import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ZavodControllerService, ZavodDto } from 'build/openapi';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BreadcrumbDto } from 'src/app/shared/dto/breadcrumb.dto';
import { BreadcrumbTypVlozeniEnum } from 'src/app/shared/enums/breadcrumb-typ-vlozeni.enum';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { SeznamBaseClass } from 'src/app/shared/pages/base/seznam-base.class';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { UiService } from 'src/app/shared/services/ui.service';
import { DetailZavodPage } from '../detail-zavod/detail-zavod.page';

@Component({
  selector: 'app-seznam-zavod',
  templateUrl: './seznam-zavod.page.html'
  //styleUrls: ['./seznam-zavod.page.css']
})

export class SeznamZavodPage extends SeznamBaseClass implements OnInit {
  @ViewChild(DetailZavodPage) detailZavodPage?: DetailZavodPage;
  @ViewChild('formDetail') public formDetail?: NgForm;

  zavody$?: Observable<ZavodDto[] | undefined>;
  private zavodyPom$?: Observable<ZavodDto[] | undefined>;

  aktivita: boolean = true;

  constructor(
    private readonly uiService: UiService,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly zavodControllerService: ZavodControllerService,
    private readonly breadcrumbService: BreadcrumbService
  ) {
    super();
    breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto("ZAVOD.NAZEV_SEZNAM", true, window.location.hash));
  }

  podminkaRadek(zavodDto: ZavodDto): string | null {
    return zavodDto.aktivita ? null : "radek-neaktivni";
  }

  showNovyDetail() {
    this.detailZavodPage?.showNovyDetail();
  }

  showDetailDialog(zavodDto: ZavodDto) {
    this.detailZavodPage?.showDetailDialog(zavodDto);
  }

  zmenaNacistAktivita() {
    this.aktivita = !this.aktivita;
    this.breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto(this.aktivita ? "ZAVOD.NAZEV_SEZNAM" : "ZAVOD.NAZEV_SEZNAM_ODSTRANENE", true, window.location.hash));
    this.refreshSeznam();
  }

  private refreshSeznam() {
    this.zavody$ = undefined;
    setTimeout(() => {
      this.refreshToken$.next(undefined);
      this.zavody$ = this.zavodyPom$;
    }, 10);
  }

  vychoziNastaveniSloupcu() {
    this.cols = [
      // { field: 'id', header: 'ZAVOD.ID', width: '150px', defaultVisible: true },
      { field: 'sapId', header: 'ZAVOD.SAP_ID', width: '100px', defaultVisible: true },
      { field: 'nazev', header: 'ZAVOD.NAZEV', width: '350px', defaultVisible: true },
      // { field: 'datumOd', header: 'ZAVOD.DATUM_OD', typeColumn: SeznamTypeColumnEnum.Datum, width: '130px', defaultVisible: true },
      // { field: 'datumDo', header: 'ZAVOD.DATUM_DO', typeColumn: SeznamTypeColumnEnum.Datum, width: '130px', defaultVisible: true },
    ];
  }

  ngOnInit(): void {
    var that = this;
    super.ngOnInit();

    this.zavody$ = this.refreshToken$.pipe(
      switchMap(() => {
        return this.zavodControllerService.listZavod(this.aktivita, this.translateService.currentLang).pipe(
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
    this.zavodyPom$ = this.zavody$;
  }
}
