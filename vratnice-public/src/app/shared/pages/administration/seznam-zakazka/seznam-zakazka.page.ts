import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ZakazkaControllerService, ZakazkaDto } from 'build/openapi';
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
import { DetailZakazkaPage } from '../detail-zakazka/detail-zakazka.page';

@Component({
  selector: 'app-seznam-zakazka',
  templateUrl: './seznam-zakazka.page.html'
  //styleUrls: ['./seznam-zakazka.page.css']
})

export class SeznamZakazkaPage extends SeznamBaseClass implements OnInit {
  @ViewChild(DetailZakazkaPage) detailZakazkaPage?: DetailZakazkaPage;
  @ViewChild('formDetail') public formDetail?: NgForm;

  zakazky$?: Observable<ZakazkaDto[] | undefined>;
  private zakazkyPom$?: Observable<ZakazkaDto[] | undefined>;

  aktivita: boolean = true;

  constructor(
    private readonly uiService: UiService,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly zakazkaControllerService: ZakazkaControllerService,
    private readonly breadcrumbService: BreadcrumbService
  ) {
    super();
    breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto("ZAKAZKA.NAZEV_SEZNAM", true, window.location.hash));
  }

  podminkaRadek(zakazkaDto: ZakazkaDto): string | null {
    return zakazkaDto.aktivita ? null : "radek-neaktivni";
  }

  showNovyDetail() {
    this.detailZakazkaPage?.showNovyDetail();
  }

  showDetailDialog(zakazkaDto: ZakazkaDto) {
    this.detailZakazkaPage?.showDetailDialog(zakazkaDto);
  }

  zmenaNacistAktivita() {
    this.aktivita = !this.aktivita;
    this.breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto(this.aktivita ? "ZAKAZKA.NAZEV_SEZNAM" : "ZAKAZKA.NAZEV_SEZNAM_ODSTRANENE", true, window.location.hash));
    this.refreshSeznam();
  }

  private refreshSeznam() {
    this.zakazky$ = undefined;
    setTimeout(() => {
      this.refreshToken$.next(undefined);
      this.zakazky$ = this.zakazkyPom$;
    }, 10);
  }

  vychoziNastaveniSloupcu() {
    this.cols = [
      // { field: 'id', header: 'ZAKAZKA.KOD', width: '140px', defaultVisible: true },
      { field: 'sapId', header: 'ZAKAZKA.SAP_ID_SEZNAM', width: '100px', defaultVisible: true },
      { field: 'virtualni', header: 'ZAKAZKA.VIRTUALNI', typeColumn: SeznamTypeColumnEnum.Boolean, width: '100px', defaultVisible: true },
      { field: 'nazev', header: 'ZAKAZKA.NAZEV', width: '350px', defaultVisible: true }
    ];
  }

  ngOnInit(): void {
    var that = this;
    super.ngOnInit();

    this.zakazky$ = this.refreshToken$.pipe(
      switchMap(() => {
        return this.zakazkaControllerService.listZakazka(this.aktivita, undefined, this.translateService.currentLang).pipe(
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
    this.zakazkyPom$ = this.zakazky$;
  }
}
